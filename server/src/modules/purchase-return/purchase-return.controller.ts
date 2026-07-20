import { Body, Controller, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CreatePurchaseReturnFromInboundDto,
  CreatePurchaseReturnFromRequestDto,
  OperatePurchaseReturnDto,
  UpdatePurchaseReturnDto,
} from './dto/purchase-return.dto';
import { PurchaseReturnService } from './purchase-return.service';

@ApiTags('采购退料')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-returns')
export class PurchaseReturnController {
  constructor(private readonly service: PurchaseReturnService) {}

  @Get()
  findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 20, @Query('returnNo') returnNo?: string, @Query('supplierId') supplierId?: string, @Query('status') status?: string, @Query('payableStatus') payableStatus?: string) {
    return this.service.findAll(Number(page), Number(pageSize), returnNo, supplierId, status === undefined ? undefined : Number(status), payableStatus);
  }

  @Get(':id')
  findById(@Param('id') id: string) { return this.service.findById(id); }

  @Post('from-inbound')
  createFromInbound(@Body() dto: CreatePurchaseReturnFromInboundDto) { return this.service.createFromInbound(dto); }

  @Post('from-inventory-in')
  createFromInventoryIn(@Body() dto: CreatePurchaseReturnFromInboundDto) { return this.service.createFromInbound(dto); }

  @Post('from-return-request')
  createFromReturnRequest(@Body() dto: CreatePurchaseReturnFromRequestDto) { return this.service.createFromReturnRequest(dto); }

  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePurchaseReturnDto) { return this.service.update(id, dto); }

  @Post(':id/submit')
  submit(@Param('id') id: string) { return this.service.submit(id); }

  @Post(':id/approve')
  approve(@Param('id') id: string, @Body() dto: OperatePurchaseReturnDto) { return this.service.approve(id, dto); }

  @Post(':id/reject')
  reject(@Param('id') id: string) { return this.service.reject(id); }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) { return this.service.cancel(id); }

  @Post(':id/retry-payable')
  retryPayable(@Param('id') id: string, @Body() dto: OperatePurchaseReturnDto) { return this.service.generateRedPayable(id, dto.operatedBy); }

  @Post(':id/generate-red-payable')
  generateRedPayable(@Param('id') id: string, @Body() dto: OperatePurchaseReturnDto) { return this.service.generateRedPayable(id, dto.operatedBy); }
}
