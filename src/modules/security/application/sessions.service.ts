import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../../users/entities/user.entity';
import { SessionsRepository } from '../infrastructure/sessions.repository';
import { RefreshPayload } from '../../auth/interfaces/jwt.payloads.interface';
import { SessionsQueryRepository } from '../infrastructure/sessions.query.repository';
import { SessionEntity } from '../entities/session.entity';

@Injectable()
export class SessionsService {
  constructor(
    private jwtService: JwtService,
    private sessionsRepository: SessionsRepository,
    private sessionsQueryRepository: SessionsQueryRepository
  ) {}

  async createSession(
    user: UserEntity,
    sessionData: { ip: string; deviceName: string; userId: string },
    refreshToken: string
  ) {
    const decodedRefreshToken = this.jwtService.decode(
      refreshToken
    ) as RefreshPayload;

    const newSession = SessionEntity.create(user, {
      decodedRefreshToken,
      refreshToken,
      ip: sessionData.ip,
      deviceName: sessionData.deviceName || 'unknown',
    });
    await this.sessionsRepository.save(newSession);
  }

  async deleteSessionByDeviceId(deviceId: string, userId: string) {
    const session = await this.sessionsQueryRepository.findSessionByDeviceId(
      deviceId
    );
    if (!session)
      throw new NotFoundException('Session with this id doesnt exist');
    if (session.userId !== userId)
      throw new ForbiddenException('You cant delete not your own session');
    await this.sessionsRepository.deleteSessionByDeviceId(deviceId);
  }

  async updateSessionDates(refreshToken: string) {
    // when refresh token
    const { iat, exp, deviceId } = this.jwtService.decode(
      refreshToken
    ) as RefreshPayload;
    const session = await this.sessionsQueryRepository.findSessionByDeviceId(
      deviceId
    );
    session.issuedAt = new Date(iat * 1000);
    session.expiresIn = new Date(exp * 1000);
    session.refreshToken = refreshToken;
    await this.sessionsRepository.save(session);
  }
}
