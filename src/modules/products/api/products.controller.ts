import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { ProductEntity } from '../entities/product.entity';
import { ProductsQueryRepository } from '../infrastructure/repositories/query/products.query.repository';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { CreateSubscriptionCommand } from '../application/use-cases/create-subscription.use-case';
import { CurrentUserId } from '../../shared/decorators/current-user-id.decorator';
import { Response } from 'express';
import { MakePaidSubscriptionDto } from './dto/input/make-paid-subscription.dto';

@ApiBearerAuth()
@Controller('products')
@UseGuards(JwtAuthGuard)
@ApiTags('Products')
export class ProductsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly productsQueryRepository: ProductsQueryRepository
  ) {}

  @Get()
  async getProducts(): Promise<ProductEntity[]> {
    return this.productsQueryRepository.getAllAvailableProducts();
  }

  @Post(':productId/make-paid-subscribe')
  async buyProduct(
    @Body() dto: MakePaidSubscriptionDto,
    @Param('productId') productId: string,
    @CurrentUserId() currentUserId: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const redirectPaymentUrl = await this.commandBus.execute(
      new CreateSubscriptionCommand(productId, dto.paymentSystem, currentUserId)
    );
    res.redirect(redirectPaymentUrl);
  }
}
