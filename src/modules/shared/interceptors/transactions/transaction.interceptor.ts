import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  Scope,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { lastValueFrom, Observable, of } from 'rxjs';
import { AuditLogEntity } from '../../entity/audit-log.entity';
import { AuditLogRepository } from '../../infrastructure/auditLog.repository';
import { EntityManagerContext } from './entityManager.context';
import { ConfigService } from '@nestjs/config';

@Injectable({ scope: Scope.REQUEST })
export class TransactionInterceptor implements NestInterceptor {
  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly auditLogRepository: AuditLogRepository,
    private readonly entityManagerContext: EntityManagerContext
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<any>> {
    if (this.configService.get('DATABASE_TRANSACTIONS_AND_LOGS') !== 'true') {
      //skip
      return of(await lastValueFrom(next.handle()));
    }

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

    this.entityManagerContext.manager = queryRunner.manager;

    try {
      const responseFromEndPoint = await lastValueFrom(next.handle());
      await queryRunner.commitTransaction();
      await this.createAuditLog({ body, method, userId, endpoint });
      return of(responseFromEndPoint);
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
