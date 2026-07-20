import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreatePurchaseReturnRequestFromInboundDto,
  OperatePurchaseReturnRequestDto,
  UpdatePurchaseReturnRequestDto,
} from './dto/purchase-return-request.dto';
import { PurchaseReturnRequestService } from './purchase-return-request.service';

@ApiTags('采购退料申请')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-return-requests')
export class PurchaseReturnRequestController {
  constructor(private readonly service: PurchaseReturnRequestService) {}

  @Get()
  findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 20, @Query('requestNo') requestNo?: string, @Query('supplierId') supplierId?: string, @Query('status') status?: string) {
    return this.service.findAll(Number(page), Number(pageSize), requestNo, supplierId, status === undefined ? undefined : Number(status));
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post('from-inbound')
  createFromInbound(@Body() dto: CreatePurchaseReturnRequestFromInboundDto) {
    return this.service.createFromInbound(dto);
  }

  @Post('from-inventory-in')
  createFromInventoryIn(@Body() dto: CreatePurchaseReturnRequestFromInboundDto) {
    return this.service.createFromInbound(dto);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseReturnRequestDto) {
    return this.service.update(id, dto);
  }

  @Post(':id/submit')
  submit(@Param('id') id: string) { return this.service.submit(id); }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() dto: OperatePurchaseReturnRequestDto) { return this.service.approve(id, dto); }

  @Post(':id/reject')
  reject(@Param('id') id: string) { return this.service.reject(id); }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) { return this.service.cancel(id); }
}
