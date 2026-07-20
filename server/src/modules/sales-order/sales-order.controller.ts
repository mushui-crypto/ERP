import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SalesOrderService } from './sales-order.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateSalesOrderDto, UpdateSalesOrderDto } from './dto/sales-order.dto';

@ApiTags('销售订单')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('sales-orders')
export class SalesOrderController {
  constructor(private readonly salesOrderService: SalesOrderService) {}

  @Get()
  @ApiOperation({ summary: '获取销售订单列表' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('orderNo') orderNo?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    const statusNum = status ? Number(status) : undefined;
    return this.salesOrderService.findAll(pageNum, pageSizeNum, orderNo, customerId, statusNum);
  }

  @Get('status/:status')
  @ApiOperation({ summary: '按状态查询销售订单' })
  async findByStatus(
    @Param('status') status: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.salesOrderService.findByStatus(Number(status), pageNum, pageSizeNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取销售订单详情' })
  async findOne(@Param('id') id: string) {
    return this.salesOrderService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建销售订单' })
  async create(@Body() dto: CreateSalesOrderDto) {
    return this.salesOrderService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新销售订单' })
  async update(@Param('id') id: string, @Body() dto: UpdateSalesOrderDto) {
    return this.salesOrderService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除销售订单' })
  async remove(@Param('id') id: string) {
    await this.salesOrderService.remove(id);
    return null;
  }

  @Post(':id/submit')
  @ApiOperation({ summary: '提交销售订单' })
  async submit(@Param('id') id: string) {
    return this.salesOrderService.submit(id);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '审核销售订单' })
  async approve(@Param('id') id: string) {
    return this.salesOrderService.approve(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消销售订单' })
  async cancel(@Param('id') id: string) {
    return this.salesOrderService.cancel(id);
  }

  @Post(':id/close')
  @ApiOperation({ summary: '关闭销售订单' })
  async close(@Param('id') id: string) {
    return this.salesOrderService.close(id);
  }

  @Post('from-quote')
  @ApiOperation({ summary: '从销售报价生成订单' })
  async createFromQuote(@Body() body: { quoteId: string }) {
    return this.salesOrderService.createFromQuote(body.quoteId);
  }

  @Get('quote/:quoteId')
  @ApiOperation({ summary: '按销售报价查询订单' })
  async findByQuoteId(@Param('quoteId') quoteId: string) {
    return this.salesOrderService.findByQuoteId(quoteId);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取销售订单统计' })
  async getStatistics(@Query('period') period?: string) {
    return this.salesOrderService.getStatistics(period);
  }
}