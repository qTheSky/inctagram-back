import { Module, forwardRef } from '@nestjs/common';
import { SessionsService } from './application/sessions.service';
import { JwtModule } from '@nestjs/jwt';
import { SessionsRepository } from './infrastructure/sessions.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from './entities/session.entity';
import { BadRefreshTokenEntity } from './entities/bad-refresh-token.entity';
import { BadRefreshTokensRepository } from './infrastructure/bad-refresh-tokens.repository';
import { SessionsController } from './api/session.controller';
import { CqrsModule } from '@nestjs/cqrs';

import { SessionsQueryRepository } from './infrastructure/sessions.query.repository';
import { DeleteSessionByDeviceIdUseCase } from './application/useCases/delete-session-by-device-id-use.case';
import { DeleteSessionsExceptCurrentUseCase } from './application/useCases/delete-sessions-except-current.use-case';
import { AuthModule } from '../auth/auth.module';

const useCases = [
  DeleteSessionsExceptCurrentUseCase,
  DeleteSessionByDeviceIdUseCase,
  SessionsService,
];
const adapters = [
  SessionsRepository,
  SessionsQueryRepository,
  BadRefreshTokensRepository,
];
@Module({
  imports: [
    forwardRef(() => AuthModule),
    CqrsModule,
    JwtModule,
    TypeOrmModule.forFeature([SessionEntity, BadRefreshTokenEntity]),
  ],
  controllers: [SessionsController],
  providers: [...useCases, ...adapters],
  exports: [SessionsService, ...adapters],
})
export class SecurityModule {}
