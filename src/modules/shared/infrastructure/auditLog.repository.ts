import { Injectable } from '@nestjs/common';
import { AbstractRepository } from '../classes/abstract.repository';
import { AuditLogEntity } from '../entity/audit-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityManagerContext } from '../interceptors/transactions/entityManager.context';

@Injectable()
export class AuditLogRepository extends AbstractRepository<AuditLogEntity> {
  constructor(
    @InjectRepository(AuditLogEntity) private repo: Repository<AuditLogEntity>,
    private readonly entityManagerContext: EntityManagerContext
  ) {
    super(repo, entityManagerContext);
  }
}
