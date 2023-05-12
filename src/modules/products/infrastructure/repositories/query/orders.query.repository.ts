import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderEntity } from '../../../entities/order.entity';
import { OrderViewDto } from '../../../api/dto/view/order.view-dto';

@Injectable()
export class OrdersQueryRepository {
  constructor(
    @InjectRepository(OrderEntity)
    private readonly repo: Repository<OrderEntity>
  ) {}

  async getUserOrders(userId: string): Promise<OrderEntity[]> {
    return this.repo.find({ where: { userId } });
  }

  buildViewModel(order: OrderEntity): OrderViewDto {
    return {
      createdAt: order.createdAt,
      productIds: order.productIds,
      status: order.status,
      totalPrice: order.totalPrice,
      updatedAt: order.updatedAt,
      type: order.type,
    };
  }
}
