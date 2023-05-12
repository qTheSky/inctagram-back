import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductEntity } from '../../entities/product.entity';
import { AbstractRepository } from '../../../shared/classes/abstract.repository';
import { EntityManagerContext } from '../../../shared/interceptors/transactions/entityManager.context';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductsRepository extends AbstractRepository<ProductEntity> {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repo: Repository<ProductEntity>,
    private readonly entityManagerContext: EntityManagerContext
  ) {
    super(repo, entityManagerContext);
  }
}
