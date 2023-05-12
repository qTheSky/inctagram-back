import { PaymentSystem } from '../../../enums/payment-system.enum';
import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MakePaidSubscriptionDto {
  @ApiProperty({
    description: 'payment system which user wishes to make payment',
    example: 'stripe',
    enum: PaymentSystem,
  })
  @IsEnum(PaymentSystem)
  paymentSystem: PaymentSystem;
}
