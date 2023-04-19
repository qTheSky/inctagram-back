import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { SessionsService } from '../../../security/application/sessions.service';
import { Inject, forwardRef } from '@nestjs/common';

export class RefreshTokenCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenUseCase
  implements ICommandHandler<RefreshTokenCommand>
{
  constructor(
    @Inject(forwardRef(() => SessionsService))
    private sessionsService: SessionsService,
    private authService: AuthService
  ) {}

  async execute(
    command: RefreshTokenCommand
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const userId = this.authService.getUserIdByTokenOrThrow(
      command.refreshToken
    );
    await this.authService.checkIsRefreshTokenInBlackList(
      userId,
      command.refreshToken
    );
    const refreshPayload = await this.authService.putRefreshTokenToBlackList(
      command.refreshToken
    );
    const { refreshToken, accessToken } = await this.authService.generateTokens(
      userId,
      refreshPayload.deviceId
    );
    await this.sessionsService.updateSessionDates(refreshToken);
    return { refreshToken, accessToken };
  }
}
