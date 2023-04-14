import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IGoogleUser } from '../../interfaces/google.user.interface';
import { ISessionMetaData } from '../../../security/interfaces/session-metadata.interface';
import { LoginCommand } from './login.use-case';
import {
  UsersQueryRepository,
  UsersRepository,
} from '../../../users/infrastructure';
import { UserEntity } from '../../../users/entities';
import { ILoginTokens } from '../../interfaces/login-tokens.interface';
import randomWords from 'random-words';

export class GoogleLoginCommand {
  constructor(
    public googleUser: IGoogleUser,
    public sessionMetadata: ISessionMetaData
  ) {}
}

@CommandHandler(GoogleLoginCommand)
export class GoogleLoginUseCase implements ICommandHandler<GoogleLoginCommand> {
  constructor(
    private commandBus: CommandBus,
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository
  ) {}

  async execute({
    googleUser,
    sessionMetadata,
  }: GoogleLoginCommand): Promise<ILoginTokens> {
    const user = await this.usersQueryRepository.findUserByEmail(
      googleUser.email
    );
    if (user) {
      return await this.commandBus.execute(
        new LoginCommand(user, sessionMetadata)
      );
    } else {
      return await this.createUserAngLogHimIn(googleUser, sessionMetadata);
    }
  }

  private async createUserAngLogHimIn(
    googleUser: IGoogleUser,
    sessionMetadata: ISessionMetaData
  ): Promise<ILoginTokens> {
    const foundUserByLogin =
      await this.usersQueryRepository.findUserByLoginOrEmail(
        googleUser.displayName
      );
    const isGoogleDisplayNameUnique = !foundUserByLogin;
    const newUser = UserEntity.create(
      {
        login: isGoogleDisplayNameUnique
          ? googleUser.displayName
          : await this.generateRandomUniqueLogin(),
        password: 'this user uses google oauth',
        email: googleUser.email,
        passwordHash: 'this user uses google oauth',
      },
      false
    );
    const savedUser = await this.usersRepository.save(newUser);
    return await this.commandBus.execute(
      new LoginCommand(savedUser, sessionMetadata)
    );
  }

  /**
   * this function will create random UNIQUE login
   */
  private async generateRandomUniqueLogin() {
    let login: string;
    let user: UserEntity | null;

    // The 'do' block will be executed at least once and then the loop will continue
    // as long as the condition specified in the 'while' is true.
    do {
      // Generate a single random word
      login = randomWords({ exactly: 1, join: '' });

      // Find user by generated login
      user = await this.usersQueryRepository.findUserByLoginOrEmail(login);

      // If 'user' is not null, it means the generated login is already in use.
      // In that case, the loop will continue, and a new login will be generated.
    } while (user);

    // When the loop exits, it means we've found a unique login
    return login.charAt(0).toUpperCase() + login.slice(1); // it makes first letter to uppercase
  }
}
