import { Module } from '@nestjs/common';
import { ProductsController } from './api/products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from './entities/product.entity';
import { ProductsQueryRepository } from './infrastructure/repositories/query/products.query.repository';
import { CqrsModule } from '@nestjs/cqrs';
import { OrderEntity } from './entities/order.entity';
import { OrdersRepository } from './infrastructure/repositories/orders.repository';
import { ProductsRepository } from './infrastructure/repositories/products.repository';
import { SharedModule } from '../shared/shared.module';
import { CreateSubscriptionUseCase } from './application/use-cases/create-subscription.use-case';
import { UsersModule } from '../users/users.module';
import { PaymentEntity } from './entities/payment.entity';
import { PaymentsRepository } from './infrastructure/repositories/payments.repository';
import { StripeAdapter } from './infrastructure/adapters/stripe.adapter';
import { StripeController } from './api/stripe.controller';
import { FinishPaymentUseCase } from './application/use-cases/finish-payment.use-case';
import { PaymentAdapter } from './infrastructure/adapters/payment.adapter';
import { PaidSubscriptionEntity } from './entities/paid-subscription.entity';
import { PaidSubscriptionsRepository } from './infrastructure/repositories/paid-subscriptions.repository';
import { PaidSubscriptionsController } from './api/paid-subscriptions.controller';
import { PaidSubscriptionsQueryRepository } from './infrastructure/repositories/query/paid-subscriptions.query.repository';
import { OrdersQueryRepository } from './infrastructure/repositories/query/orders.query.repository';
import { OrdersController } from './api/orders.controller';

const useCases = [FinishPaymentUseCase, CreateSubscriptionUseCase];
const adapters = [
  StripeAdapter,
  ProductsRepository,
  ProductsQueryRepository,
  OrdersRepository,
  PaymentsRepository,
  PaidSubscriptionsRepository,
  PaymentAdapter,
  PaidSubscriptionsQueryRepository,
  OrdersQueryRepository,
];

@Module({
  imports: [
    SharedModule,
    UsersModule,
    CqrsModule,
    TypeOrmModule.forFeature([
      ProductEntity,
      OrderEntity,
      PaymentEntity,
      PaidSubscriptionEntity,
    ]),
  ],
  controllers: [
    OrdersController,
    PaidSubscriptionsController,
    ProductsController,
    StripeController,
  ],
  providers: [...adapters, ...useCases],
})
export class ProductsModule {}
