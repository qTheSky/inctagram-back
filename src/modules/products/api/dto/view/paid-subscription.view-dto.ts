import { SubscriptionSubjectType } from '../../../enums/susbscription-type.enum';

export class PaidSubscriptionViewDto {
  id: string;
  createdAt: Date;
  subject: SubscriptionSubjectType;
  expiresAt: Date;
}
