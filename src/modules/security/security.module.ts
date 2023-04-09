import { Module } from '@nestjs/common';
import { SessionsService } from './application/sessions.service';
import { JwtModule } from '@nestjs/jwt';
import { SessionsRepository } from './infrastructure/sessions.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from './entities/session.entity';
import { BadRefreshTokenEntity } from './entities/bad-refresh-token.entity';
import { BadRefreshTokensRepository } from './infrastructure/bad-refresh-tokens.repository';

@Module({
  imports: [
    JwtModule,
    TypeOrmModule.forFeature([SessionEntity, BadRefreshTokenEntity]),
  ],
  providers: [SessionsService, SessionsRepository, BadRefreshTokensRepository],
  exports: [SessionsService, SessionsRepository, BadRefreshTokensRepository],
})
export class SecurityModule {}
