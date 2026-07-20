import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WarehouseService } from './warehouse.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('仓库管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('warehouses')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get()
  @ApiOperation({ summary: '获取仓库列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.warehouseService.findAll(pageNum, pageSizeNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取仓库详情' })
  async findOne(@Param('id') id: string) {
    return this.warehouseService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建仓库' })
  async create(@Body() data: any) {
    return this.warehouseService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新仓库' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.warehouseService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除仓库' })
  async remove(@Param('id') id: string) {
    await this.warehouseService.remove(id);
    return null;
  }
}
