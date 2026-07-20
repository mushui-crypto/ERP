import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { InventoryOutService } from './inventory-out.service';
import { ApproveInventoryOutDto, CreateInventoryOutDto, CreateInventoryOutFromAssetRequestDto, UpdateInventoryOutDto } from './dto/inventory-out.dto';

@Controller('inventory-out')
export class InventoryOutController {
  constructor(private inventoryOutService: InventoryOutService) {}

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('outNo') outNo?: string,
    @Query('materialCode') materialCode?: string,
    @Query('outType') outType?: number,
  ) {
    return this.inventoryOutService.findAll(+page, +pageSize, outNo, materialCode, outType);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.inventoryOutService.findById(id);
  }

  @Post()
  async create(@Body() dto: CreateInventoryOutDto) {
    return this.inventoryOutService.create(dto);
  }

  @Post('from-asset-out-request/:requestId')
  async createFromAssetOutRequest(@Param('requestId') requestId: string, @Body() dto: CreateInventoryOutFromAssetRequestDto) {
    return this.inventoryOutService.createFromAssetOutRequest(requestId, dto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateInventoryOutDto) {
    return this.inventoryOutService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.inventoryOutService.remove(id);
  }

  @Post(':id/submit')
  async submit(@Param('id') id: string) {
    return this.inventoryOutService.submit(id);
  }

  @Post(':id/approve')
  async approve(@Param('id') id: string, @Body() dto: ApproveInventoryOutDto = {}) {
    return this.inventoryOutService.approve(id, dto);
  }

  @Post(':id/generate-asset-cards')
  async generateAssetCards(@Param('id') id: string) {
    return this.inventoryOutService.generateAssetCards(id);
  }

  @Post(':id/reject')
  async reject(@Param('id') id: string) {
    return this.inventoryOutService.reject(id);
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string) {
    return this.inventoryOutService.cancel(id);
  }
}
