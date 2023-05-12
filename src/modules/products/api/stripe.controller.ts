import {
  Controller,
  ForbiddenException,
  Post,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { CommandBus } from '@nestjs/cqrs';
import Stripe from 'stripe';
import { StripeAdapter } from '../infrastructure/adapters/stripe.adapter';
import { FinishPaymentCommand } from '../application/use-cases/finish-payment.use-case';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('stripe')
export class StripeController {
  constructor(
    private readonly stripeAdapter: StripeAdapter,
    private readonly commandBus: CommandBus,
    private readonly configService: ConfigService
  ) {}

  @Post('webhook')
  async webhook(@Req() req: RawBodyRequest<Request>) {
    const signature = req.headers['stripe-signature'];

    try {
      const event = this.stripeAdapter.api.webhooks.constructEvent(
        req.rawBody,
        signature,
        this.configService.get('STRIPE_WEBHOOK_SIGNING_SECRET')
      );
      if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        await this.commandBus.execute(
          new FinishPaymentCommand(session.client_reference_id, event)
        );
      }
    } catch (e) {
      console.log(e);
      throw new ForbiddenException(`Webhook Error: ${e.message}`);
    }
  }
}
