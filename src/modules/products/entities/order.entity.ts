import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { BaseEntity } from '../../shared/classes/base.entity';
import { UserEntity } from '../../users/entities';
import { PaymentEntity } from './payment.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { OrderType } from '../enums/order-type';

@Entity('orders')
export class OrderEntity extends BaseEntity {
  @Column({ type: 'text', array: true })
  productIds: string[];

  @Column()
  type: OrderType;

  @Column()
  totalPrice: number;

  @OneToOne(() => PaymentEntity, (payment) => payment.order)
  @JoinColumn({ name: 'paymentId' })
  payment: PaymentEntity;
  @Column()
  paymentId: string;

  @ManyToOne(() => UserEntity, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;
  @Column()
  userId: string;

  @Column()
  status: PaymentStatus;
}
