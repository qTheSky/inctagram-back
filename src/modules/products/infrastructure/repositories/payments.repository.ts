import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaymentEntity } from '../../entities/payment.entity';
import { AbstractRepository } from '../../../shared/classes/abstract.repository';
import { Repository } from 'typeorm';
import { EntityManagerContext } from '../../../shared/interceptors/transactions/entityManager.context';

@Injectable()
export class PaymentsRepository extends AbstractRepository<PaymentEntity> {
  constructor(
    @InjectRepository(PaymentEntity)
    private readonly repo: Repository<PaymentEntity>,
    private readonly entityManagerContext: EntityManagerContext
  ) {
    super(repo, entityManagerContext);
  }
}
