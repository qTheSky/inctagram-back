import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SessionEntity } from '../entities/session.entity';
import { Repository } from 'typeorm';
import { SessionViewModel } from '../api/dto/view/SessionViewModel';

@Injectable()
export class SessionsQueryRepository {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionsQueryRepository: Repository<SessionEntity>
  ) {}

  buildResponseSession(session: SessionEntity): SessionViewModel {
    return {
      ip: session.ip,
      deviceId: session.deviceId,
      lastActiveDate: session.issuedAt.toISOString(),
      title: session.deviceName,
    };
  }

  async findAllSessionsOfUser(userId: string): Promise<SessionEntity[]> {
    return this.sessionsQueryRepository.findBy({ userId });
  }

  async findSessionByDeviceId(deviceId: string): Promise<SessionEntity> {
    return this.sessionsQueryRepository.findOneBy({ deviceId });
  }
}
