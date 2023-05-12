import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ProductsRepository } from '../../infrastructure/repositories/products.repository';
import { OrdersRepository } from '../../infrastructure/repositories/orders.repository';
import { OrderEntity } from '../../entities/order.entity';
import { UsersRepository } from '../../../users/infrastructure';
import { PaymentEntity } from '../../entities/payment.entity';
import { PaymentSystem } from '../../enums/payment-system.enum';
import { PaymentsRepository } from '../../infrastructure/repositories/payments.repository';
import { randomUUID } from 'crypto';
import { PaymentStatus } from '../../enums/payment-status.enum';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { PaymentAdapter } from '../../infrastructure/adapters/payment.adapter';
import { OrderType } from '../../enums/order-type';
import { ProductType } from '../../enums/product-type.enum';

export class CreateSubscriptionCommand {
  constructor(
    public productId: string,
    public paymentSystem: PaymentSystem,
    public currentUserId: string
  ) {}
}
@CommandHandler(CreateSubscriptionCommand)
export class CreateSubscriptionUseCase
  implements ICommandHandler<CreateSubscriptionCommand>
{
  constructor(
    private readonly productsRepository: ProductsRepository,
    private readonly ordersRepository: OrdersRepository,
    private readonly usersRepository: UsersRepository,
    private readonly paymentsRepository: PaymentsRepository,
    private readonly paymentAdapter: PaymentAdapter
  ) {}

  async execute({
    productId,
    currentUserId,
    paymentSystem,
  }: CreateSubscriptionCommand): Promise<string> {
    const user = await this.usersRepository.findOne({
      id: currentUserId,
    });

    const product = await this.productsRepository.findOne({ id: productId });
    if (!product) throw new NotFoundException('Product not found');
    if (product.type !== ProductType.Subscription)
      throw new ForbiddenException('You cant subscribe to this product');

    const payment = PaymentEntity.create(product.price, paymentSystem);

    const order = new OrderEntity();
    order.id = randomUUID();
    order.productIds = [product.id];
    order.totalPrice = product.price;
    order.status = PaymentStatus.Pending;
    order.type = OrderType.PaidSubscription;

    order.user = user;
    order.payment = payment;
    payment.order = order;

    const paymentProviderInfo = await this.paymentAdapter.createPayment(
      payment
    );

    payment.paymentSystemData = paymentProviderInfo;

    await Promise.all([
      this.paymentsRepository.save(payment),
      this.ordersRepository.save(order),
    ]);
    return paymentProviderInfo.url;
  }
}
