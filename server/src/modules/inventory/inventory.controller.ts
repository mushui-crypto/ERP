import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InventoryService } from './inventory.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateInventoryDto, UpdateInventoryDto, InventoryAdjustDto } from './dto/inventory.dto';

@ApiTags('库存管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  @ApiOperation({ summary: '获取库存列表' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('warehouseId') warehouseId?: string,
    @Query('materialId') materialId?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.inventoryService.findAll(pageNum, pageSizeNum, warehouseId, materialId);
  }

  @Get('summary')
  @ApiOperation({ summary: '库存汇总统计' })
  async getStockSummary() {
    return this.inventoryService.getStockSummary();
  }

  @Get('warehouse/:warehouseId')
  @ApiOperation({ summary: '按仓库查询库存' })
  async findByWarehouse(@Param('warehouseId') warehouseId: string) {
    return this.inventoryService.findByWarehouse(warehouseId);
  }

  @Get('material/:materialId')
  @ApiOperation({ summary: '按物料查询库存' })
  async findByMaterial(@Param('materialId') materialId: string) {
    return this.inventoryService.findByMaterial(materialId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取库存详情' })
  async findOne(@Param('id') id: string) {
    return this.inventoryService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建库存记录' })
  async create(@Body() dto: CreateInventoryDto) {
    return this.inventoryService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新库存记录' })
  async update(@Param('id') id: string, @Body() dto: UpdateInventoryDto) {
    return this.inventoryService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除库存记录' })
  async remove(@Param('id') id: string) {
    await this.inventoryService.remove(id);
    return null;
  }

  @Post(':id/adjust')
  @ApiOperation({ summary: '调整库存' })
  async adjustStock(@Param('id') id: string, @Body() dto: InventoryAdjustDto) {
    return this.inventoryService.adjustStock(id, dto);
  }
}