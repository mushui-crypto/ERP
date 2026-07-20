import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EquipmentService } from './equipment.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('设备档案管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('equipments')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  @ApiOperation({ summary: '获取设备列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.equipmentService.findAll(pageNum, pageSizeNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取设备详情' })
  async findOne(@Param('id') id: string) {
    return this.equipmentService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建设备' })
  async create(@Body() data: any) {
    return this.equipmentService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新设备' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.equipmentService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除设备' })
  async remove(@Param('id') id: string) {
    await this.equipmentService.remove(id);
    return null;
  }
}
