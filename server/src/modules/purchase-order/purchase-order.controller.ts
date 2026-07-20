import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreatePurchaseOrderDto,
  PushPurchaseRequestToOrderDto,
  UpdatePurchaseOrderDto,
} from './dto/purchase-order.dto';
import { PurchaseOrderService } from './purchase-order.service';

@ApiTags('采购订单')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-orders')
export class PurchaseOrderController {
  constructor(private readonly purchaseOrderService: PurchaseOrderService) {}

  @Get()
  @ApiOperation({ summary: '获取采购订单列表' })
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('orderNo') orderNo?: string,
    @Query('supplierId') supplierId?: string,
    @Query('status') status?: string,
  ) {
    return this.purchaseOrderService.findAll(Number(page) || 1, Number(pageSize) || 20, orderNo, supplierId, status === undefined ? undefined : Number(status));
  }

  @Get('status/:status')
  findByStatus(@Param('status') status: string, @Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    return this.purchaseOrderService.findByStatus(Number(status), Number(page) || 1, Number(pageSize) || 20);
  }

  @Get('request/:requestId')
  findByRequestId(@Param('requestId') requestId: string) {
    return this.purchaseOrderService.findByRequestId(requestId);
  }

  @Get('statistics')
  getStatistics(@Query('period') period?: string) {
    return this.purchaseOrderService.getStatistics(period);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.purchaseOrderService.findById(id);
  }

  @Post()
  create(@Body() dto: CreatePurchaseOrderDto) {
    return this.purchaseOrderService.create(dto);
  }

  @Post('from-request')
  @ApiOperation({ summary: '采购申请明细下推采购订单' })
  createFromRequest(@Body() dto: PushPurchaseRequestToOrderDto) {
    return this.purchaseOrderService.createFromRequest(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderDto) {
    return this.purchaseOrderService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.purchaseOrderService.remove(id);
    return null;
  }

  @Post(':id/submit')
  submit(@Param('id') id: string) {
    return this.purchaseOrderService.submit(id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.purchaseOrderService.approve(id);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string) {
    return this.purchaseOrderService.reject(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.purchaseOrderService.cancel(id);
  }

  @Post(':id/close')
  close(@Param('id') id: string) {
    return this.purchaseOrderService.close(id);
  }
}
