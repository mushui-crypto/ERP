import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesOrderModule } from '../sales-order/sales-order.module';
import { SalesQuoteModule } from '../sales-quote/sales-quote.module';

@Module({
  imports: [SalesOrderModule, SalesQuoteModule],
  controllers: [SalesController],
})
export class SalesModule {}
