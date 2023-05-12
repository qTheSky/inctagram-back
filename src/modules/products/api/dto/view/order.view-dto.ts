import { PaymentStatus } from '../../../enums/payment-status.enum';
import { OrderType } from '../../../enums/order-type';

export class OrderViewDto {
  createdAt: Date;
  updatedAt: Date;
  productIds: string[];
  type: OrderType;
  totalPrice: number;
  status: PaymentStatus;
}
