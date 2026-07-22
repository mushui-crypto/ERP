import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreatePurchaseOrderChangeDto,
  OperatePurchaseOrderChangeDto,
  UpdatePurchaseOrderChangeDto,
} from './dto/purchase-order-change.dto';
import { PurchaseOrderChangeService } from './purchase-order-change.service';

@ApiTags('采购订单变更')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-order-changes')
export class PurchaseOrderChangeController {
  constructor(private readonly service: PurchaseOrderChangeService) {}

  @Get()
  @ApiOperation({ summary: '查询采购订单变更单' })
  findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('status') status?: string,
    @Query('orderNo') orderNo?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.service.findAll(Number(page) || 1, Number(pageSize) || 20, status === undefined ? undefined : Number(status), orderNo, supplierId);
  }

  @Get('order/:orderId')
  @ApiOperation({ summary: '查询采购订单变更历史' })
  findByOrder(@Param('orderId') orderId: string) {
    return this.service.findByOrder(orderId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post('from-order')
  @ApiOperation({ summary: '从已审核采购订单创建变更单' })
  createFromOrder(@Body() dto: CreatePurchaseOrderChangeDto) {
    return this.service.createFromOrder(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseOrderChangeDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string) {
    return this.service.submit(id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() dto: OperatePurchaseOrderChangeDto = {}) {
    return this.service.approve(id, dto);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string, @Body() dto: OperatePurchaseOrderChangeDto = {}) {
    return this.service.reject(id, dto);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Body() dto: OperatePurchaseOrderChangeDto = {}) {
    return this.service.cancel(id, dto);
  }
}
