import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { SalesQuoteService } from './sales-quote.service';
import { CreateSalesQuoteDto, UpdateSalesQuoteDto } from './dto/sales-quote.dto';

@Controller('sales-quote')
export class SalesQuoteController {
  constructor(private salesQuoteService: SalesQuoteService) {}

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('quoteNo') quoteNo?: string,
    @Query('customerCode') customerCode?: string,
    @Query('status') status?: number,
  ) {
    return this.salesQuoteService.findAll(+page, +pageSize, quoteNo, customerCode, status);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.salesQuoteService.findById(id);
  }

  @Get('status/:status')
  async findByStatus(
    @Param('status') status: number,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.salesQuoteService.findByStatus(+status, +page, +pageSize);
  }

  @Post()
  async create(@Body() dto: CreateSalesQuoteDto) {
    return this.salesQuoteService.create(dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSalesQuoteDto) {
    return this.salesQuoteService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.salesQuoteService.remove(id);
  }

  @Post(':id/submit')
  async submit(@Param('id') id: string) {
    return this.salesQuoteService.submit(id);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string) {
    return this.salesQuoteService.approve(id);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string) {
    return this.salesQuoteService.reject(id);
  }

  @Post(':id/convert-to-order')
  async convertToOrder(
    @Param('id') id: string,
    @Body('salesOrderId') salesOrderId: string,
    @Body('salesOrderNo') salesOrderNo: string,
  ) {
    return this.salesQuoteService.convertToOrder(id, salesOrderId, salesOrderNo);
  }

  @Post(':id/expire')
  async expire(@Param('id') id: string) {
    return this.salesQuoteService.expire(id);
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.salesQuoteService.cancel(id);
  }
}