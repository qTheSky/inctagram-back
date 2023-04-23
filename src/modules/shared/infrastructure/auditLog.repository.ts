import { Injectable } from '@nestjs/common';
import { AbstractRepository } from '../classes/abstract.repository';
import { AuditLogEntity } from '../entity/audit-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class AuditLogRepository extends AbstractRepository<AuditLogEntity> {
  constructor(
    @InjectRepository(AuditLogEntity) private repo: Repository<AuditLogEntity>
  ) {
    super(repo);
  }
}
