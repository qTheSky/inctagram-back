import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserEntity } from '../../../users/entities/user.entity';
import { AuthService } from '../auth.service';
import { SessionsService } from '../../../security/application/sessions.service';

export class LoginCommand {
  constructor(
    public user: UserEntity,
    public ip: string,
    public deviceName: string
  ) {}
}

@CommandHandler(LoginCommand)
export class LoginUseCase implements ICommandHandler<LoginCommand> {
  constructor(
    private authService: AuthService,
    private sessionsService: SessionsService
  ) {}

  async execute(
    command: LoginCommand
  ): Promise<{ refreshToken: string; accessToken: string }> {
    const { refreshToken, accessToken } = await this.authService.generateTokens(
      command.user.id
    );
    await this.sessionsService.createSession(
      command.user,
      {
        userId: command.user.id,
        ip: command.ip,
        deviceName: command.deviceName || 'unknown',
      },
      refreshToken
    );
    return { accessToken, refreshToken };
  }
}
