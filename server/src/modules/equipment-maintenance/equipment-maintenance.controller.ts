import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EquipmentMaintenanceService } from './equipment-maintenance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('设备保养管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('equipment-maintenances')
export class EquipmentMaintenanceController {
  constructor(private readonly equipmentMaintenanceService: EquipmentMaintenanceService) {}

  @Get()
  @ApiOperation({ summary: '获取保养记录列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.equipmentMaintenanceService.findAll(pageNum, pageSizeNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取保养记录详情' })
  async findOne(@Param('id') id: string) {
    return this.equipmentMaintenanceService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建保养记录' })
  async create(@Body() data: any) {
    return this.equipmentMaintenanceService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新保养记录' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.equipmentMaintenanceService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除保养记录' })
  async remove(@Param('id') id: string) {
    await this.equipmentMaintenanceService.remove(id);
    return null;
  }
}
