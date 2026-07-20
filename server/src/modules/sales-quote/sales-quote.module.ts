import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SalesQuote } from '../../database/entities/sales-quote.entity';
import { SalesQuoteController } from './sales-quote.controller';
import { SalesQuoteService } from './sales-quote.service';

@Module({
  imports: [TypeOrmModule.forFeature([SalesQuote])],
  controllers: [SalesQuoteController],
  providers: [SalesQuoteService],
  exports: [SalesQuoteService],
})
export class SalesQuoteModule {}
