import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';

import { ISessionMetaData } from '../../../security/interfaces/session-metadata.interface';
import { LoginCommand } from './login.use-case';
import {
  UsersQueryRepository,
  UsersRepository,
} from '../../../users/infrastructure';
import { UserEntity } from '../../../users/entities';
import { ILoginTokens } from '../../interfaces/login-tokens.interface';
import randomWords from 'random-words';
import { IGitHubUser } from '../../interfaces/github.user.interface';

export class GitHubLoginCommand {
  constructor(
    public githubUser: IGitHubUser,
    public sessionMetadata: ISessionMetaData
  ) {}
}

@CommandHandler(GitHubLoginCommand)
export class GitHubLoginUseCase implements ICommandHandler<GitHubLoginCommand> {
  constructor(
    private commandBus: CommandBus,
    private usersRepository: UsersRepository,
    private usersQueryRepository: UsersQueryRepository
  ) {}

  async execute({
    githubUser,
    sessionMetadata,
  }: GitHubLoginCommand): Promise<ILoginTokens> {
    const user = await this.usersQueryRepository.findUserByEmail(
      githubUser.email
    );
    if (user) {
      return await this.commandBus.execute(
        new LoginCommand(user, sessionMetadata)
      );
    } else {
      return await this.createUserAngLogHimIn(githubUser, sessionMetadata);
    }
  }

  private async createUserAngLogHimIn(
    githubUser: IGitHubUser,
    sessionMetadata: ISessionMetaData
  ): Promise<ILoginTokens> {
    const foundUserByLogin =
      await this.usersQueryRepository.findUserByLoginOrEmail(githubUser.login);
    const isGithubDisplayNameUnique = !foundUserByLogin;
    const newUser = UserEntity.create(
      {
        login: isGithubDisplayNameUnique
          ? githubUser.login
          : await this.generateRandomUniqueLogin(),
        password: 'this user uses github oauth',
        email: githubUser.email,
        passwordHash: 'this user uses github oauth',
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
