import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MetaFieldService } from './meta-field.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateMetaFieldDto, UpdateMetaFieldDto } from './dto/meta-field.dto';

@ApiTags('元数据字段管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meta-fields')
export class MetaFieldController {
  constructor(private readonly metaFieldService: MetaFieldService) {}

  @Get()
  @ApiOperation({ summary: '获取元数据字段列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.metaFieldService.findAll(pageNum, pageSizeNum);
  }

  @Get('entity/:entityId')
  @ApiOperation({ summary: '根据实体ID获取字段列表' })
  async findByEntityId(@Param('entityId') entityId: string) {
    return this.metaFieldService.findByEntityId(entityId);
  }

  @Get('entity/code/:entityCode')
  @ApiOperation({ summary: '根据实体编码获取字段列表' })
  async findByEntityCode(@Param('entityCode') entityCode: string) {
    return this.metaFieldService.findByEntityCode(entityCode);
  }

  @Get('entity/:entityCode/searchable')
  @ApiOperation({ summary: '获取可搜索字段' })
  async getSearchableFields(@Param('entityCode') entityCode: string) {
    return this.metaFieldService.getSearchableFields(entityCode);
  }

  @Get('entity/:entityCode/list')
  @ApiOperation({ summary: '获取列表字段' })
  async getListFields(@Param('entityCode') entityCode: string) {
    return this.metaFieldService.getListFields(entityCode);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取元数据字段详情' })
  async findOne(@Param('id') id: string) {
    return this.metaFieldService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建元数据字段' })
  async create(@Body() data: CreateMetaFieldDto) {
    return this.metaFieldService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新元数据字段' })
  async update(@Param('id') id: string, @Body() data: UpdateMetaFieldDto) {
    return this.metaFieldService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除元数据字段' })
  async remove(@Param('id') id: string) {
    await this.metaFieldService.remove(id);
    return null;
  }
}