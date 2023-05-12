import { Injectable } from '@nestjs/common';
import { PaymentSystem } from '../../enums/payment-system.enum';
import { IPaymentAdapter } from '../../interfaces/payment-adapter.interface';
import { StripeAdapter } from './stripe.adapter';
import { PaymentEntity } from '../../entities/payment.entity';

@Injectable()
export class PaymentAdapter {
  adapters: Partial<Record<PaymentSystem, IPaymentAdapter>> = {};
  constructor(private stripeAdapter: StripeAdapter) {
    this.adapters[PaymentSystem.Stripe] = this.stripeAdapter;
  }

  async createPayment(payment: PaymentEntity) {
    return this.adapters[payment.paymentSystem].createPayment(payment);
  }
}
