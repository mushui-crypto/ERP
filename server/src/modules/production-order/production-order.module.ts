import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductionOrderService } from './production-order.service';
import { ProductionOrderController } from './production-order.controller';
import { ProductionOrder } from '../../database/entities/production-order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ProductionOrder])],
  providers: [ProductionOrderService],
  controllers: [ProductionOrderController],
  exports: [ProductionOrderService],
})
export class ProductionOrderModule {}
