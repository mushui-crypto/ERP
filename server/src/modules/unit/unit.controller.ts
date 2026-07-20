import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UnitService } from './unit.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('计量单位管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('units')
export class UnitController {
  constructor(private readonly unitService: UnitService) {}

  @Get()
  @ApiOperation({ summary: '获取计量单位列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.unitService.findAll(pageNum, pageSizeNum);
  }

  @Get('code/:code')
  @ApiOperation({ summary: '根据编码获取计量单位' })
  async findByCode(@Param('code') code: string) {
    return this.unitService.findByCode(code);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取计量单位详情' })
  async findOne(@Param('id') id: string) {
    return this.unitService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建计量单位' })
  async create(@Body() data: any) {
    return this.unitService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新计量单位' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.unitService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除计量单位' })
  async remove(@Param('id') id: string) {
    await this.unitService.remove(id);
    return null;
  }
}
