import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { OrderEntity } from '../../entities/order.entity';
import { Repository } from 'typeorm';
import { AbstractRepository } from '../../../shared/classes/abstract.repository';
import { EntityManagerContext } from '../../../shared/interceptors/transactions/entityManager.context';

@Injectable()
export class OrdersRepository extends AbstractRepository<OrderEntity> {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repo: Repository<OrderEntity>,
    private readonly entityManagerContext: EntityManagerContext
  ) {
    super(repo, entityManagerContext);
  }
}
