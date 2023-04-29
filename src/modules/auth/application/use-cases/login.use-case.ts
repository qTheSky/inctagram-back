import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserEntity } from '../../../users/entities';
import { AuthService } from '../auth.service';
import { SessionsService } from '../../../security/application/sessions.service';
import { ISessionMetaData } from '../../../security/interfaces/session-metadata.interface';
import { ILoginTokens } from '../../interfaces/login-tokens.interface';
import { Inject, forwardRef } from '@nestjs/common';

export class LoginCommand {
  constructor(
    public user: UserEntity,
    public sessionMetaData: ISessionMetaData
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    @Inject(forwardRef(() => SessionsService))
    private sessionsService: SessionsService,
    private authService: AuthService
  ) {}

  async execute(command: LoginCommand): Promise<ILoginTokens> {
    const { refreshToken, accessToken } = await this.authService.generateTokens(
      command.user
    );
    await this.sessionsService.createSession(
      command.user,
      {
        userId: command.user.id,
        ip: command.sessionMetaData.ip,
        deviceName: command.sessionMetaData.deviceName || 'unknown',
      },
      refreshToken
    );
    return { accessToken, refreshToken };
  }
}
