import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { SessionsService } from '../../../security/application/sessions.service';
import { Inject, forwardRef } from '@nestjs/common';
import { UsersQueryRepository } from '../../../../modules/users/infrastructure';

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
    private usersQueryRepository: UsersQueryRepository,
    private authService: AuthService
  ) {}

  async execute(
    command: RefreshTokenCommand
  ): Promise<{ accessToken: string; refreshToken: string }> {
    await this.authService.checkIsRefreshTokenInBlackList(command.refreshToken);
    const userId = this.authService.getUserIdByTokenOrThrow(
      command.refreshToken
    );
    const user = await this.usersQueryRepository.findUserById(userId);
    const refreshPayload = await this.authService.putRefreshTokenToBlackList(
      command.refreshToken
    );
    const { refreshToken, accessToken } = await this.authService.generateTokens(
      user,
      refreshPayload.deviceId
    );
    await this.sessionsService.updateSessionDates(refreshToken);
    return { refreshToken, accessToken };
  }
}
