import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  PushPurchaseOrderToReceiveNoticeDto,
  ReversePurchaseReceiveNoticeDto,
  UpdatePurchaseReceiveNoticeDto,
} from './dto/purchase-receive-notice.dto';
import { PurchaseReceiveNoticeService } from './purchase-receive-notice.service';

@ApiTags('收料/请检通知')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-receive-notices')
export class PurchaseReceiveNoticeController {
  constructor(private readonly service: PurchaseReceiveNoticeService) {}

  @Get()
  @ApiOperation({ summary: '获取收料/请检通知列表' })
  findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('noticeNo') noticeNo?: string,
    @Query('purchaseOrderId') purchaseOrderId?: string,
    @Query('supplierId') supplierId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll({
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 20,
      noticeNo,
      purchaseOrderId,
      supplierId,
      status: status === undefined ? undefined : Number(status),
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post('from-order')
  @ApiOperation({ summary: '采购订单下推收料/请检通知' })
  createFromOrder(@Body() dto: PushPurchaseOrderToReceiveNoticeDto) {
    return this.service.createFromOrder(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseReceiveNoticeDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string) {
    return this.service.submit(id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.service.approve(id);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string) {
    return this.service.reject(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.service.cancel(id);
  }

  @Post(':id/reverse')
  @ApiOperation({ summary: '冲销已审核且无检验、无入库下游的收料通知' })
  reverse(@Param('id') id: string, @Body() dto: ReversePurchaseReceiveNoticeDto) {
    return this.service.reverse(id, dto);
  }

  @Post(':id/close')
  close(@Param('id') id: string) {
    return this.service.close(id);
  }
}
