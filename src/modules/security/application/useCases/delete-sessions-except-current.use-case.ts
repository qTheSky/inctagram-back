import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthService } from '../../../auth/application/auth.service';
import { JwtService } from '@nestjs/jwt';
import { RefreshPayload } from '../../../../modules/auth/interfaces/jwt.payloads.interface';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { SessionsQueryRepository } from '../../infrastructure/sessions.query.repository';
import { Inject, forwardRef } from '@nestjs/common';

export class DeleteSessionsExceptCurrentCommand {
  constructor(public refreshToken: string) {}
}

@CommandHandler(DeleteSessionsExceptCurrentCommand)
export class DeleteSessionsExceptCurrentUseCase
  implements ICommandHandler<DeleteSessionsExceptCurrentCommand>
{
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private jwtService: JwtService,
    private sessionsRepository: SessionsRepository,
    private sessionsQueryRepository: SessionsQueryRepository
  ) {}
  async execute(command: DeleteSessionsExceptCurrentCommand): Promise<void> {
    const userId = this.authService.getUserIdByTokenOrThrow(
      command.refreshToken
    );
    const allSessionsOfUser =
      await this.sessionsQueryRepository.findAllSessionsOfUser(userId);
    const { deviceId } = this.jwtService.decode(
      command.refreshToken
    ) as RefreshPayload;
    for (const session of allSessionsOfUser) {
      if (session.deviceId !== deviceId) {
        await this.authService.putRefreshTokenToBlackList(session.refreshToken);
      }
    }
    await this.sessionsRepository.deleteSessionsExceptCurrent(userId, deviceId);
  }
}
