import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ISessionMetaData } from '../../../security/interfaces/session-metadata.interface';
import { ISocialUser } from '../../interfaces/social.user.interface';
import {
  UsersQueryRepository,
  UsersRepository,
} from '../../../users/infrastructure';
import { ILoginTokens } from '../../interfaces/login-tokens.interface';
import { LoginCommand } from './login.use-case';
import { UserEntity } from '../../../users/entities';
import randomWords from 'random-words';

export class SocialLoginCommand {
  constructor(
    public socialUser: ISocialUser,
    public sessionMetadata: ISessionMetaData
  ) {}
}

@CommandHandler(SocialLoginCommand)
export class SocialLoginUseCase implements ICommandHandler<SocialLoginCommand> {
  constructor(
    private commandBus: CommandBus,
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository
  ) {}

  async execute({
    socialUser,
    sessionMetadata,
  }: SocialLoginCommand): Promise<ILoginTokens> {
    const user = await this.usersQueryRepository.findUserByEmail(
      socialUser.email
    );
    if (user) {
      return await this.commandBus.execute(
        new LoginCommand(user, sessionMetadata)
      );
    } else {
      return await this.createUserAngLogHimIn(socialUser, sessionMetadata);
    }
  }

  private async createUserAngLogHimIn(
    socialUser: ISocialUser,
    sessionMetadata: ISessionMetaData
  ): Promise<ILoginTokens> {
    const foundUserByLogin =
      await this.usersQueryRepository.findUserByLoginOrEmail(socialUser.login);
    const isSocialDisplayNameUnique = !foundUserByLogin;
    const newUser = UserEntity.create(
      {
        login: isSocialDisplayNameUnique
          ? socialUser.login
          : await this.generateRandomUniqueLogin(),
        email: socialUser.email,
        passwordHash: 'this user uses social oauth',
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
