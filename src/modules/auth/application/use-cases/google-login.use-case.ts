import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IGoogleUser } from '../../interfaces/google.user.interface';
import { ISessionMetaData } from '../../../security/interfaces/session-metadata.interface';
import { LoginCommand } from './login.use-case';
import {
  UsersProfilesRepository,
  UsersQueryRepository,
  UsersRepository,
} from '../../../users/infrastructure';
import { UserEntity } from '../../../users/entities';
import { randomUUID } from 'crypto';
import { ILoginTokens } from '../../interfaces/login-tokens.interface';

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
    private usersQueryRepository: UsersQueryRepository,
    private usersProfilesRepository: UsersProfilesRepository
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
          : randomUUID(),
        password: 'this user uses google oauth',
        email: googleUser.email,
        passwordHash: 'this user uses google oauth',
      },
      false
    );
    const savedUser = await this.usersRepository.save(newUser);
    const userProfile = await this.usersProfilesRepository.getUserProfile(
      savedUser.id
    );
    userProfile.avatarUrl = googleUser.avatarUrl;
    return await this.commandBus.execute(
      new LoginCommand(savedUser, sessionMetadata)
    );
  }
}
