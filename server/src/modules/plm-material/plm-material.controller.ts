import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { PlmMaterialService } from './plm-material.service';
import { PlmMaterial } from '../../database/entities/plm-material.entity';

@Controller('plm-material')
export class PlmMaterialController {
  constructor(private plmMaterialService: PlmMaterialService) {}

  @Get('statistics')
  async getMaterialStatistics() {
    return this.plmMaterialService.getMaterialStatistics();
  }

  @Get('expiring')
  async findExpiringMaterials(@Query('days') days = 30) {
    return this.plmMaterialService.findExpiringMaterials(days);
  }

  @Get()
  async findMaterials(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('materialType') materialType?: string,
    @Query('categoryCode') categoryCode?: string,
  ) {
    return this.plmMaterialService.findMaterials(page, pageSize, materialType, categoryCode);
  }

  @Get(':id')
  async findMaterialById(@Param('id') id: string) {
    return this.plmMaterialService.findMaterialById(id);
  }

  @Get('code/:materialCode')
  async findMaterialByCode(@Param('materialCode') materialCode: string) {
    return this.plmMaterialService.findMaterialByCode(materialCode);
  }

  @Post()
  async createMaterial(@Body() data: Partial<PlmMaterial>) {
    return this.plmMaterialService.createMaterial(data);
  }

  @Put(':id')
  async updateMaterial(@Param('id') id: string, @Body() data: Partial<PlmMaterial>) {
    return this.plmMaterialService.updateMaterial(id, data);
  }

  @Put(':id/retire')
  async retireMaterial(@Param('id') id: string) {
    return this.plmMaterialService.retireMaterial(id);
  }

  @Delete(':id')
  async deleteMaterial(@Param('id') id: string) {
    return this.plmMaterialService.deleteMaterial(id);
  }
}