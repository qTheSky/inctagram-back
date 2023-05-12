import { Injectable } from '@nestjs/common';
import { AbstractRepository } from '../../../shared/classes/abstract.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EntityManagerContext } from '../../../shared/interceptors/transactions/entityManager.context';
import { PaidSubscriptionEntity } from '../../entities/paid-subscription.entity';

@Injectable()
export class PaidSubscriptionsRepository extends AbstractRepository<PaidSubscriptionEntity> {
  constructor(
    @InjectRepository(PaidSubscriptionEntity)
    private readonly repo: Repository<PaidSubscriptionEntity>,
    private readonly entityManagerContext: EntityManagerContext
  ) {
    super(repo, entityManagerContext);
  }
}
