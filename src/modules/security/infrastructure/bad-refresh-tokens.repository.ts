import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRefreshTokenEntity } from '../entities/bad-refresh-token.entity';
import { AbstractRepository } from '../../shared/classes/abstract.repository';
import { EntityManagerContext } from '../../shared/interceptors/transactions/entityManager.context';

@Injectable()
export class BadRefreshTokensRepository extends AbstractRepository<BadRefreshTokenEntity> {
  constructor(
    @InjectRepository(BadRefreshTokenEntity)
    private readonly badRefreshTokenRepository: Repository<BadRefreshTokenEntity>,
    private readonly entityManagerContext: EntityManagerContext
  ) {
    super(badRefreshTokenRepository, entityManagerContext);
  }
}
