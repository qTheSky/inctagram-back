import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUserId } from '../../shared/decorators/current-user-id.decorator';
import { PaidSubscriptionViewDto } from './dto/view/paid-subscription.view-dto';
import { PaidSubscriptionsQueryRepository } from '../infrastructure/repositories/query/paid-subscriptions.query.repository';

@Controller('paid-subscriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@ApiTags('Paid subscriptions')
export class PaidSubscriptionsController {
  constructor(
    private readonly paidSubscriptionsQueryRepository: PaidSubscriptionsQueryRepository
  ) {}

  @Get('my')
  async getMyPaidSubscriptions(
    @CurrentUserId() currentUserId: string
  ): Promise<PaidSubscriptionViewDto[]> {
    const userSubscriptions =
      await this.paidSubscriptionsQueryRepository.getPaidSubscriptionsOfUser(
        currentUserId
      );
    return userSubscriptions.map(
      this.paidSubscriptionsQueryRepository.buildViewModel
    );
  }
}
