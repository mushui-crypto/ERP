import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  CancelPurchaseReconciliationDto,
  ConfirmPurchaseReconciliationDto,
  GeneratePurchaseReconciliationDto,
} from './dto/purchase-reconciliation.dto';
import { PurchaseReconciliationService } from './purchase-reconciliation.service';

@ApiTags('采购对账')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('purchase-reconciliations')
export class PurchaseReconciliationController {
  constructor(private readonly service: PurchaseReconciliationService) {}

  @Post('generate')
  @ApiOperation({ summary: '按固定维度生成采购对账单' })
  generate(@Body() dto: GeneratePurchaseReconciliationDto) {
    return this.service.generate(dto);
  }

  @Get()
  findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('supplierId') supplierId?: string,
    @Query('purchaseOrgId') purchaseOrgId?: string,
    @Query('status') status?: string,
  ) {
    return this.service.findAll(Number(page) || 1, Number(pageSize) || 20, supplierId, purchaseOrgId, status === undefined ? undefined : Number(status));
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post(':id/confirm')
  confirm(@Param('id') id: string, @Body() dto: ConfirmPurchaseReconciliationDto) {
    return this.service.confirm(id, dto);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string, @Body() dto: CancelPurchaseReconciliationDto) {
    return this.service.cancel(id, dto);
  }
}
