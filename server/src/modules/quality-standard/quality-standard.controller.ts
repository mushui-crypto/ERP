import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { QualityStandardService } from './quality-standard.service';

@Controller('quality-standard')
export class QualityStandardController {
  constructor(private qualityStandardService: QualityStandardService) {}

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('standardCode') standardCode?: string,
    @Query('materialId') materialId?: string,
  ) {
    return this.qualityStandardService.findAll(+page, +pageSize, standardCode, materialId);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.qualityStandardService.findById(id);
  }

  @Get(':id/items')
  async findWithItems(@Param('id') id: string) {
    return this.qualityStandardService.findWithItems(id);
  }

  @Get('material/:materialId')
  async findByMaterialId(@Param('materialId') materialId: string) {
    return this.qualityStandardService.findByMaterialId(materialId);
  }

  @Post()
  async create(@Body() data: { standard: any; items?: any[] }) {
    return this.qualityStandardService.create(data.standard, data.items || []);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: any) {
    return this.qualityStandardService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.qualityStandardService.remove(id);
  }

  @Post(':id/items')
  async addItems(@Param('id') id: string, @Body() items: any[]) {
    return this.qualityStandardService.addItems(id, items);
  }

  @Put('items/:itemId')
  async updateItem(@Param('itemId') itemId: string, @Body() data: any) {
    return this.qualityStandardService.updateItem(itemId, data);
  }

  @Delete('items/:itemId')
  async removeItem(@Param('itemId') itemId: string) {
    return this.qualityStandardService.removeItem(itemId);
  }
}