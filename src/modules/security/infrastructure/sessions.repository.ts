import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { SessionEntity } from '../entities/session.entity';
import { AbstractRepository } from '../../shared/classes/abstract.repository';
import { EntityManagerContext } from '../../shared/interceptors/transactions/entityManager.context';

@Injectable()
export class SessionsRepository extends AbstractRepository<SessionEntity> {
  constructor(
    @InjectRepository(SessionEntity)
    private readonly sessionsRepository: Repository<SessionEntity>,
    private readonly entityManagerContext: EntityManagerContext
  ) {
    super(sessionsRepository, entityManagerContext);
  }

  async deleteAllSessionsOfUser(userId: string) {
    return this.sessionsRepository.delete({ userId });
  }

  async deleteSessionByDeviceId(deviceId: string) {
    return this.sessionsRepository.delete({ deviceId });
  }

  async deleteSessionsExceptCurrent(userId: string, currentDeviceId: string) {
    return this.sessionsRepository.delete({
      userId,
      deviceId: Not(currentDeviceId),
    });
  }
}
