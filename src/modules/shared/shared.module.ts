import { Module } from '@nestjs/common';
import { TransactionInterceptor } from './interceptors/transactions/transaction.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogRepository } from './infrastructure/auditLog.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditLogEntity } from './entity/audit-log.entity';
import { EntityManagerContext } from './interceptors/transactions/entityManager.context';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLogEntity])],
  providers: [
    EntityManagerContext,
    AuditLogRepository,
    {
      provide: APP_INTERCEPTOR,
      useClass: TransactionInterceptor,
    },
  ],
  exports: [AuditLogRepository, EntityManagerContext],
})
export class SharedModule {}
