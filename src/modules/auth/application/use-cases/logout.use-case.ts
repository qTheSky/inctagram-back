import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { SessionsService } from '../../../security/application/sessions.service';
import { Inject, forwardRef } from '@nestjs/common';

export class LogoutCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(LogoutCommand)
export class LogoutUseCase implements ICommandHandler<LogoutCommand> {
  constructor(
    @Inject(forwardRef(() => SessionsService))
    private sessionsService: SessionsService,
    private authService: AuthService
  ) {}

  async execute(command: LogoutCommand): Promise<void> {
    await this.authService.checkIsRefreshTokenInBlackList(command.refreshToken);

    const userId = this.authService.getUserIdByTokenOrThrow(
      command.refreshToken
    );
    const refreshPayload = await this.authService.putRefreshTokenToBlackList(
      command.refreshToken
    );
    await this.sessionsService.deleteSessionByDeviceId(
      refreshPayload.deviceId,
      userId
    );
  }
}
