import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MaterialService } from './material.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/material.dto';

@ApiTags('物料管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) {}

  @Get()
  @ApiOperation({ summary: '获取物料列表' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('materialCode') materialCode?: string,
    @Query('materialName') materialName?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.materialService.findAll(pageNum, pageSizeNum, materialCode, materialName);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取物料详情' })
  async findOne(@Param('id') id: string) {
    return this.materialService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建物料' })
  async create(@Body() dto: CreateMaterialDto) {
    return this.materialService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新物料' })
  async update(@Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.materialService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除物料' })
  async remove(@Param('id') id: string) {
    await this.materialService.remove(id);
    return null;
  }
}