import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUserId } from '../../shared/decorators/current-user-id.decorator';
import { OrdersQueryRepository } from '../infrastructure/repositories/query/orders.query.repository';
import { OrderViewDto } from './dto/view/order.view-dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Orders')
@Controller('orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersQueryRepository: OrdersQueryRepository) {}

  @Get('my')
  async getOrdersOfUser(
    @CurrentUserId() currentUserId: string
  ): Promise<OrderViewDto[]> {
    const orders = await this.ordersQueryRepository.getUserOrders(
      currentUserId
    );
    return orders.map(this.ordersQueryRepository.buildViewModel);
  }
}
