import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { PaymentsRepository } from '../../infrastructure/repositories/payments.repository';
import { OrdersRepository } from '../../infrastructure/repositories/orders.repository';
import { PaymentStatus } from '../../enums/payment-status.enum';
import { OrderType } from '../../enums/order-type';
import { PaidSubscriptionEntity } from '../../entities/paid-subscription.entity';
import { ProductsRepository } from '../../infrastructure/repositories/products.repository';
import { SubscriptionSubjectType } from '../../enums/susbscription-type.enum';
import { PaidSubscriptionsRepository } from '../../infrastructure/repositories/paid-subscriptions.repository';
import { UsersRepository } from '../../../users/infrastructure';
import { add } from 'date-fns';
import { OrderEntity } from '../../entities/order.entity';
import { PaymentEntity } from '../../entities/payment.entity';

export class FinishPaymentCommand {
  constructor(public paymentId: string, public event: any) {}
}
@CommandHandler(FinishPaymentCommand)
export class FinishPaymentUseCase
  implements ICommandHandler<FinishPaymentCommand>
{
  constructor(
    private readonly paymentsRepository: PaymentsRepository,
    private readonly paidSubscriptionsRepository: PaidSubscriptionsRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly usersRepository: UsersRepository,
    private readonly productsRepository: ProductsRepository
  ) {}

  async execute({ paymentId, event }: FinishPaymentCommand) {
    const payment = await this.paymentsRepository.findOne({ id: paymentId });
    const order = await this.ordersRepository.findOne({ paymentId }, ['user']);
    payment.status = PaymentStatus.Paid;
    payment.confirmPaymentSystemData = event.data;
    order.status = PaymentStatus.Paid;

    if (order.type === OrderType.PaidSubscription) {
      const product = await this.productsRepository.findOne({
        id: order.productIds[0],
      });
      const paidSubscription = new PaidSubscriptionEntity();
      paidSubscription.user = order.user;
      paidSubscription.subject = product.title as SubscriptionSubjectType;
      paidSubscription.expiresAt = add(new Date(), { years: 100 });
      await Promise.all([
        this.paidSubscriptionsRepository.save(paidSubscription),
        this.saveOrderAndPayment(order, payment),
      ]);
    }
  }

  private async saveOrderAndPayment(
    order: OrderEntity,
    payment: PaymentEntity
  ) {
    await Promise.all([
      this.paymentsRepository.save(payment),
      this.ordersRepository.save(order),
    ]);
  }
}
