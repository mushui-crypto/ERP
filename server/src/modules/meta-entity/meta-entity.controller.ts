import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MetaEntityService } from './meta-entity.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateMetaEntityDto, UpdateMetaEntityDto } from './dto/meta-entity.dto';

@ApiTags('元数据实体管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('meta-entities')
export class MetaEntityController {
  constructor(private readonly metaEntityService: MetaEntityService) {}

  @Get()
  @ApiOperation({ summary: '获取元数据实体列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.metaEntityService.findAll(pageNum, pageSizeNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取元数据实体详情' })
  async findOne(@Param('id') id: string) {
    return this.metaEntityService.findById(id);
  }

  @Get('code/:code')
  @ApiOperation({ summary: '根据编码获取元数据实体' })
  async findByCode(@Param('code') code: string) {
    return this.metaEntityService.findByCode(code);
  }

  @Get('code/:code/fields')
  @ApiOperation({ summary: '获取实体及其字段' })
  async findWithFields(@Param('code') code: string) {
    return this.metaEntityService.findWithFields(code);
  }

  @Get('code/:code/form-schema')
  @ApiOperation({ summary: '获取表单Schema' })
  async getFormSchema(@Param('code') code: string) {
    return this.metaEntityService.getFormSchema(code);
  }

  @Post()
  @ApiOperation({ summary: '创建元数据实体' })
  async create(@Body() data: CreateMetaEntityDto) {
    return this.metaEntityService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新元数据实体' })
  async update(@Param('id') id: string, @Body() data: UpdateMetaEntityDto) {
    return this.metaEntityService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除元数据实体' })
  async remove(@Param('id') id: string) {
    await this.metaEntityService.remove(id);
    return null;
  }
}