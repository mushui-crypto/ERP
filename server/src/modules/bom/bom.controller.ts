import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BomService } from './bom.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('BOM管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bom')
export class BomController {
  constructor(private readonly bomService: BomService) {}

  @Get()
  @ApiOperation({ summary: '获取BOM列表' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('bomNo') bomNo?: string,
    @Query('materialId') materialId?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.bomService.findAll(pageNum, pageSizeNum, bomNo, materialId);
  }

  @Get('material/:materialId')
  @ApiOperation({ summary: '按物料查询BOM' })
  async findByMaterialId(@Param('materialId') materialId: string) {
    return this.bomService.findByMaterialId(materialId);
  }

  @Get('material/:materialId/default')
  @ApiOperation({ summary: '获取物料默认BOM' })
  async findDefaultByMaterialId(@Param('materialId') materialId: string) {
    return this.bomService.findDefaultByMaterialId(materialId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取BOM详情' })
  async findOne(@Param('id') id: string) {
    return this.bomService.findById(id);
  }

  @Get(':id/details')
  @ApiOperation({ summary: '获取BOM及其明细' })
  async findWithDetails(@Param('id') id: string) {
    return this.bomService.findWithDetails(id);
  }

  @Post()
  @ApiOperation({ summary: '创建BOM' })
  async create(@Body() data: { bom: any; details?: any[] }) {
    return this.bomService.create(data.bom, data.details || []);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新BOM' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.bomService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除BOM' })
  async remove(@Param('id') id: string) {
    await this.bomService.remove(id);
    return null;
  }

  @Post(':id/default')
  @ApiOperation({ summary: '设置为默认版本' })
  async setDefault(@Param('id') id: string) {
    return this.bomService.setDefault(id);
  }

  @Post(':id/version')
  @ApiOperation({ summary: '创建版本' })
  async createVersion(@Param('id') id: string, @Body('version') version: string) {
    return this.bomService.createVersion(id, version);
  }

  @Post('compare')
  @ApiOperation({ summary: '对比两个版本' })
  async compareVersions(@Body('bomId1') bomId1: string, @Body('bomId2') bomId2: string) {
    return this.bomService.compareVersions(bomId1, bomId2);
  }

  @Get(':id/explode')
  @ApiOperation({ summary: 'BOM多级展开' })
  async explodeBom(@Param('id') id: string, @Query('levels') levels?: string) {
    const levelNum = Number(levels) || 3;
    return this.bomService.explodeBom(id, levelNum);
  }

  @Post(':id/material-requirements')
  @ApiOperation({ summary: '计算物料需求' })
  async getMaterialRequirements(@Param('id') id: string, @Body('quantity') quantity: number) {
    return this.bomService.getMaterialRequirements(id, quantity);
  }

  @Post(':id/details')
  @ApiOperation({ summary: '添加BOM明细' })
  async addDetails(@Param('id') id: string, @Body() details: any[]) {
    return this.bomService.addDetails(id, details);
  }

  @Put('details/:detailId')
  @ApiOperation({ summary: '更新BOM明细' })
  async updateDetail(@Param('detailId') detailId: string, @Body() data: any) {
    return this.bomService.updateDetail(detailId, data);
  }

  @Delete('details/:detailId')
  @ApiOperation({ summary: '删除BOM明细' })
  async removeDetail(@Param('detailId') detailId: string) {
    await this.bomService.removeDetail(detailId);
    return null;
  }
}