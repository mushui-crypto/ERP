import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  ApproveInventoryInDto,
  CreateInventoryInDto,
  GenerateEstimatedPayableDto,
  PushReceiveNoticesToInventoryInDto,
  UpdateInventoryInDto,
  UpdatePurchaseInventoryInDto,
} from './dto/inventory-in.dto';
import { InventoryInService } from './inventory-in.service';

@Controller('inventory-in')
export class InventoryInController {
  constructor(private readonly inventoryInService: InventoryInService) {}

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('inNo') inNo?: string,
    @Query('materialCode') materialCode?: string,
    @Query('inType') inType?: string,
    @Query('supplierId') supplierId?: string,
    @Query('status') status?: string,
  ) {
    return this.inventoryInService.findAll(
      Number(page) || 1,
      Number(pageSize) || 20,
      inNo,
      materialCode,
      inType === undefined ? undefined : Number(inType),
      supplierId,
      status === undefined ? undefined : Number(status),
    );
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.inventoryInService.findById(id);
  }

  /** 兼容既有非采购入库；标准采购入库不得调用此接口。 */
  @Post()
  async create(@Body() dto: CreateInventoryInDto) {
    return this.inventoryInService.create(dto);
  }

  /** 已审核收料通知下推标准采购入库。 */
  @Post('from-receive-notices')
  async createFromReceiveNotices(@Body() dto: PushReceiveNoticesToInventoryInDto) {
    return this.inventoryInService.createFromReceiveNotices(dto);
  }

  /** 兼容既有非采购入库修改；采购入库不得调用此接口。 */
  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateInventoryInDto) {
    return this.inventoryInService.update(id, dto);
  }

  /** 修改草稿或已驳回的标准采购入库，不允许修改来源价格、税率和金额。 */
  @Put(':id/purchase-draft')
  async updatePurchaseDraft(@Param('id') id: string, @Body() dto: UpdatePurchaseInventoryInDto) {
    return this.inventoryInService.updatePurchaseDraft(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.inventoryInService.remove(id);
  }

  @Post(':id/submit')
  async submit(@Param('id') id: string) {
    return this.inventoryInService.submit(id);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string, @Body() dto: ApproveInventoryInDto) {
    return this.inventoryInService.approve(id, dto);
  }

  /** 对已审核标准采购入库幂等生成或重试生成暂估应付。 */
  @Post(':id/generate-estimated-payable')
  async generateEstimatedPayable(
    @Param('id') id: string,
    @Body() dto: GenerateEstimatedPayableDto = {},
  ) {
    return this.inventoryInService.generateEstimatedPayable(id, dto.operatedBy);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string) {
    return this.inventoryInService.reject(id);
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.inventoryInService.cancel(id);
  }
}
