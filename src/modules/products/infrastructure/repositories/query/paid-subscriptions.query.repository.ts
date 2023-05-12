import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaidSubscriptionEntity } from '../../../entities/paid-subscription.entity';
import { PaidSubscriptionViewDto } from '../../../api/dto/view/paid-subscription.view-dto';
import { Repository } from 'typeorm';

@Injectable()
export class PaidSubscriptionsQueryRepository {
  constructor(
    @InjectRepository(PaidSubscriptionEntity)
    private readonly repository: Repository<PaidSubscriptionEntity>
  ) {}

  async getPaidSubscriptionsOfUser(userId: string) {
    return this.repository.find({ where: { userId } });
  }

  buildViewModel(
    subscription: PaidSubscriptionEntity
  ): PaidSubscriptionViewDto {
    return {
      subject: subscription.subject,
      createdAt: subscription.createdAt,
      id: subscription.id,
      expiresAt: subscription.expiresAt,
    };
  }
}
