import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { UserEntity } from '../../users/entities/user.entity';
import { RefreshPayload } from '../../auth/interfaces/jwt.payloads';
import { SessionEntity } from '../entities/session.entity';
import { AbstractRepository } from '../../shared/classes/abstract.repository';

@Injectable()
export class SessionsRepository extends AbstractRepository<SessionEntity> {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionsRepository: Repository<SessionEntity>
  ) {
    super(sessionsRepository);
  }
  async create(
    user: UserEntity,
    dto: {
      decodedRefreshToken: RefreshPayload;
      ip: string;
      deviceName: string;
      refreshToken: string;
    }
  ): Promise<SessionEntity> {
    const session = new SessionEntity();
    session.issuedAt = new Date(dto.decodedRefreshToken.iat * 1000);
    session.expiresIn = new Date(dto.decodedRefreshToken.exp * 1000);
    session.ip = dto.ip;
    session.deviceName = dto.deviceName;
    session.deviceId = dto.decodedRefreshToken.deviceId;
    session.refreshToken = dto.refreshToken;
    session.user = user;

    return await this.save(session);
  }

  async deleteAllSessionsOfUser(userId: number) {
    return this.sessionsRepository.delete({ userId });
  }

  async deleteSessionByDeviceId(deviceId: string) {
    return this.sessionsRepository.delete({ deviceId });
  }

  async deleteSessionsExceptCurrent(userId: number, currentDeviceId: string) {
    return this.sessionsRepository.delete({
      userId,
      deviceId: Not(currentDeviceId),
    });
  }

  async findAllSessionsOfUser(userId: number): Promise<SessionEntity[]> {
    return this.sessionsRepository.findBy({ userId });
  }

  async findSessionByDeviceId(deviceId: string): Promise<SessionEntity> {
    return this.sessionsRepository.findOneBy({ deviceId });
  }
}
