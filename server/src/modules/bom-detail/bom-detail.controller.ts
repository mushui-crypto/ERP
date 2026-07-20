import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BomDetailService } from './bom-detail.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('BOM明细')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bom-details')
export class BomDetailController {
  constructor(private readonly bomDetailService: BomDetailService) {}

  @Get()
  @ApiOperation({ summary: '获取BOM明细列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.bomDetailService.findAll(pageNum, pageSizeNum);
  }

  @Get('bom/:bomId')
  @ApiOperation({ summary: '按BOM查询明细' })
  async findByBomId(@Param('bomId') bomId: string) {
    return this.bomDetailService.findByBomId(bomId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取BOM明细详情' })
  async findOne(@Param('id') id: string) {
    return this.bomDetailService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建BOM明细' })
  async create(@Body() data: any) {
    return this.bomDetailService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新BOM明细' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.bomDetailService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除BOM明细' })
  async remove(@Param('id') id: string) {
    await this.bomDetailService.remove(id);
    return null;
  }
}
