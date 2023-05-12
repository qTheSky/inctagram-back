import { Column, Entity, OneToOne } from 'typeorm';
import { BaseEntity } from '../../shared/classes/base.entity';
import { PaymentStatus } from '../enums/payment-status.enum';
import { PaymentSystem } from '../enums/payment-system.enum';
import { OrderEntity } from './order.entity';
import { randomUUID } from 'crypto';

@Entity('payments')
export class PaymentEntity extends BaseEntity {
  @Column()
  totalPrice: number;

  @Column()
  paymentSystem: PaymentSystem;

  @Column()
  status: PaymentStatus;

  @OneToOne(() => OrderEntity, (order) => order.payment)
  order: OrderEntity;

  @Column({ nullable: true, type: 'json' })
  paymentSystemData: any;

  @Column({ nullable: true, type: 'json' })
  confirmPaymentSystemData: any;

  static create(
    totalPrice: number,
    paymentSystem: PaymentSystem
  ): PaymentEntity {
    const payment = new PaymentEntity();
    payment.id = randomUUID();
    payment.status = PaymentStatus.Pending;
    payment.totalPrice = totalPrice;
    payment.paymentSystem = paymentSystem;
    return payment;
  }
}
