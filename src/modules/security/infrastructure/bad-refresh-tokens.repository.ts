import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRefreshTokenEntity } from '../entities/bad-refresh-token.entity';
import { AbstractRepository } from '../../shared/classes/abstract.repository';

@Injectable()
export class BadRefreshTokensRepository extends AbstractRepository<BadRefreshTokenEntity> {
  constructor(
    @InjectRepository(BadRefreshTokenEntity)
    private readonly badRefreshTokenRepository: Repository<BadRefreshTokenEntity>
  ) {
    super(badRefreshTokenRepository);
  }
}
