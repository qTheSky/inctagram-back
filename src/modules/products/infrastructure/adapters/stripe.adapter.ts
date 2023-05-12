import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { IPaymentAdapter } from '../../interfaces/payment-adapter.interface';
import { PaymentEntity } from '../../entities/payment.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StripeAdapter implements IPaymentAdapter {
  api;

  constructor(private configService: ConfigService) {
    this.api = new Stripe(this.configService.get('STRIPE_TEST_SECRET_KEY'), {
      apiVersion: '2022-11-15',
    });
  }

  async createPayment(
    payment: PaymentEntity
  ): Promise<{ data: any; url: string }> {
    const session = await this.api.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            product_data: {
              name: `INCTAGRAM SHOP ${payment.order.user.email} order id: ${payment.order.id}`,
              // description: '',
            },
            unit_amount: payment.totalPrice * 100,
            currency: 'USD',
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      client_reference_id: payment.id,
      success_url: 'http://localhost:3000/stripe/success', //here must be frontend url
      cancel_url: 'http://localhost:3000/stripe/error', //here must be frontend url
    });

    return { data: session, url: session.url };
  }
}
