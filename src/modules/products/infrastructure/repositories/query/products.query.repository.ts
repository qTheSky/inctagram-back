import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from '../../../entities/product.entity';
import { MoreThan, Repository } from 'typeorm';

@Injectable()
export class ProductsQueryRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly repository: Repository<ProductEntity>
  ) {}

  async getAllAvailableProducts(): Promise<ProductEntity[]> {
    return await this.repository.find({ where: { count: MoreThan(0) } });
  }
}
