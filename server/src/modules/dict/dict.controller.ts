import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { DictService } from './dict.service';
import { CreateDictTypeDto, UpdateDictTypeDto } from './dto/dict-type.dto';
import { CreateDictDataDto, UpdateDictDataDto } from './dto/dict-data.dto';

@ApiTags('数据字典')
@Controller('dict')
@UseGuards(JwtAuthGuard)
export class DictController {
  constructor(private dictService: DictService) {}

  @Get('types')
  @ApiOperation({ summary: '获取字典类型列表' })
  @ApiResponse({ status: 200, description: '成功' })
  async findAllTypes(@Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    return this.dictService.findAllTypes(page, pageSize);
  }

  @Get('types/:id')
  @ApiOperation({ summary: '获取字典类型详情' })
  @ApiResponse({ status: 200, description: '成功' })
  async findTypeById(@Param('id') id: string) {
    return this.dictService.findTypeById(id);
  }

  @Get('types/code/:code')
  @ApiOperation({ summary: '根据编码获取字典类型' })
  @ApiResponse({ status: 200, description: '成功' })
  async findTypeByCode(@Param('code') code: string) {
    return this.dictService.findTypeByCode(code);
  }

  @Post('types')
  @ApiOperation({ summary: '创建字典类型' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createType(@Body() data: CreateDictTypeDto) {
    return this.dictService.createType(data);
  }

  @Put('types/:id')
  @ApiOperation({ summary: '更新字典类型' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateType(@Param('id') id: string, @Body() data: UpdateDictTypeDto) {
    return this.dictService.updateType(id, data);
  }

  @Delete('types/:id')
  @ApiOperation({ summary: '删除字典类型' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async removeType(@Param('id') id: string) {
    return this.dictService.removeType(id);
  }

  @Get('data')
  @ApiOperation({ summary: '获取字典数据列表' })
  @ApiResponse({ status: 200, description: '成功' })
  async findAllData(@Query('page') page = 1, @Query('pageSize') pageSize = 20, @Query('dictCode') dictCode?: string) {
    return this.dictService.findAllData(page, pageSize, dictCode);
  }

  @Get('data/:id')
  @ApiOperation({ summary: '获取字典数据详情' })
  @ApiResponse({ status: 200, description: '成功' })
  async findDataById(@Param('id') id: string) {
    return this.dictService.findDataById(id);
  }

  @Get('data/code/:code')
  @ApiOperation({ summary: '根据编码获取字典数据' })
  @ApiResponse({ status: 200, description: '成功' })
  async findDataByCode(@Param('code') code: string) {
    return this.dictService.findDataByCode(code);
  }

  @Get('data/code/tree/:code')
  @ApiOperation({ summary: '根据编码获取字典数据（树形结构）' })
  @ApiResponse({ status: 200, description: '成功' })
  async findDataByCodeWithTree(@Param('code') code: string) {
    return this.dictService.findDataByCodeWithTree(code);
  }

  @Post('data')
  @ApiOperation({ summary: '创建字典数据' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async createData(@Body() data: CreateDictDataDto) {
    return this.dictService.createData(data);
  }

  @Put('data/:id')
  @ApiOperation({ summary: '更新字典数据' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateData(@Param('id') id: string, @Body() data: UpdateDictDataDto) {
    return this.dictService.updateData(id, data);
  }

  @Delete('data/:id')
  @ApiOperation({ summary: '删除字典数据' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async removeData(@Param('id') id: string) {
    return this.dictService.removeData(id);
  }
}