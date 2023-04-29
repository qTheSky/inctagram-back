import { InjectRepository } from '@nestjs/typeorm';
import { UserSubscriptionEntity } from '../entities/user-subscription.entity';
import { AbstractRepository } from '../../shared/classes/abstract.repository';
import { EntityManagerContext } from '../../shared/interceptors/transactions/entityManager.context';
import { Repository } from 'typeorm';

export class UserSubscriptionsRepository extends AbstractRepository<UserSubscriptionEntity> {
  constructor(
    @InjectRepository(UserSubscriptionEntity)
    private readonly repo: Repository<UserSubscriptionEntity>,
    private entityManagerContext: EntityManagerContext
  ) {
    super(repo, entityManagerContext);
  }
}
