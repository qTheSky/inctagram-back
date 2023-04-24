import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { lastValueFrom } from 'rxjs';
import { AuditLogEntity } from '../entity/audit-log.entity';
import { AuditLogRepository } from '../infrastructure/auditLog.repository';

// @Injectable({ scope: Scope.REQUEST }) it doesnt work with CQRS
@Injectable()
export class TransactionInterceptor implements NestInterceptor {
  constructor(
    private readonly dataSource: DataSource,
    private readonly auditLogRepository: AuditLogRepository
  ) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    const request = context.switchToHttp().getRequest();

    if (request.method === 'GET') return next.handle();

    //metadata for create audit log
    const userId = request.user?.id;
    const endpoint = request.originalUrl;
    const body = request.body;
    const method = request.method;
    //metadata for create audit log
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    request.manager = queryRunner.manager; // it should set to context(per request) but with CQRS it doesnt work

    try {
      const responseFromEndPoint = await lastValueFrom(next.handle());
      await queryRunner.commitTransaction();
      await this.createAuditLog({ body, method, userId, endpoint });
      return responseFromEndPoint;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async createAuditLog(
    data: {
      userId: string;
      endpoint: string;
      method: string;
      body: any;
    },
    createLog = true
  ) {
    if (createLog) {
      const log = AuditLogEntity.create(
        data.userId,
        data.endpoint,
        data.method,
        data.body
      );
      await this.auditLogRepository.save(log);
    }
  }
}
