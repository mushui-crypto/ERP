import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesOrderService } from './sales-order.service';
import { SalesOrderController } from './sales-order.controller';
import { SalesOrder } from '../../database/entities/sales-order.entity';
import { SalesQuote } from '../../database/entities/sales-quote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SalesOrder, SalesQuote])],
  providers: [SalesOrderService],
  controllers: [SalesOrderController],
  exports: [SalesOrderService],
})
export class SalesOrderModule {}
