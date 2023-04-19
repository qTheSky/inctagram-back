import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  ForbiddenException,
  Inject,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { AuthService } from '../../../auth/application/auth.service';
import { SessionsRepository } from '../../infrastructure/sessions.repository';
import { SessionsQueryRepository } from '../../infrastructure/sessions.query.repository';

export class DeleteSessionByDeviceIdCommand {
  constructor(public refreshToken: string, public deviceId: string) {}
}
@CommandHandler(DeleteSessionByDeviceIdCommand)
export class DeleteSessionByDeviceIdUseCase
  implements ICommandHandler<DeleteSessionByDeviceIdCommand>
{
  constructor(
    @Inject(forwardRef(() => AuthService))
    private authService: AuthService,
    private sessionsRepository: SessionsRepository,
    private sessionsQueryRepository: SessionsQueryRepository
  ) {}
  async execute(command: DeleteSessionByDeviceIdCommand): Promise<void> {
    const userId = this.authService.getUserIdByTokenOrThrow(
      command.refreshToken
    );
    const session = await this.sessionsQueryRepository.findSessionByDeviceId(
      command.deviceId
    );
    if (!session)
      throw new NotFoundException('Session with this id doesnt exist');
    if (session.userId !== userId)
      throw new ForbiddenException('You cant delete not your own session');
    await this.authService.putRefreshTokenToBlackList(session.refreshToken);
    await this.sessionsRepository.deleteSessionByDeviceId(command.deviceId);
  }
}
