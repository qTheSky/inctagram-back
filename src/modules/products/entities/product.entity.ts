import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../shared/classes/base.entity';
import { ProductType } from '../enums/product-type.enum';

@Entity('products')
export class ProductEntity extends BaseEntity {
  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  price: number;

  @Column()
  count: number;

  @Column()
  type: ProductType;
}
