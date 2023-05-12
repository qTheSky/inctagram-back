import { PaymentEntity } from '../entities/payment.entity';

export interface IPaymentAdapter {
  createPayment(payment: PaymentEntity): Promise<{ data: any; url: string }>;
}
