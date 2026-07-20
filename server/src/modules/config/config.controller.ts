import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ConfigService } from './config.service';
import { CreateSystemConfigDto, UpdateSystemConfigDto } from './dto/config.dto';

@ApiTags('系统配置')
@Controller('config')
@UseGuards(JwtAuthGuard)
export class ConfigController {
  constructor(private configService: ConfigService) {}

  @Get()
  @ApiOperation({ summary: '获取配置列表' })
  @ApiResponse({ status: 200, description: '成功' })
  async findAll(@Query('page') page = 1, @Query('pageSize') pageSize = 20, @Query('configGroup') configGroup?: string) {
    return this.configService.findAll(page, pageSize, configGroup);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取配置详情' })
  @ApiResponse({ status: 200, description: '成功' })
  async findById(@Param('id') id: string) {
    return this.configService.findById(id);
  }

  @Get('key/:key')
  @ApiOperation({ summary: '根据键获取配置' })
  @ApiResponse({ status: 200, description: '成功' })
  async findByKey(@Param('key') key: string) {
    return this.configService.findByKey(key);
  }

  @Get('group/:group')
  @ApiOperation({ summary: '根据分组获取配置列表' })
  @ApiResponse({ status: 200, description: '成功' })
  async findByGroup(@Param('group') group: string) {
    return this.configService.findByGroup(group);
  }

  @Get('value/:key')
  @ApiOperation({ summary: '获取配置值（带类型转换）' })
  @ApiResponse({ status: 200, description: '成功' })
  async getValue(@Param('key') key: string) {
    return this.configService.getValue(key);
  }

  @Get('group/values/:group')
  @ApiOperation({ summary: '获取分组下所有配置值' })
  @ApiResponse({ status: 200, description: '成功' })
  async getGroupValues(@Param('group') group: string) {
    return this.configService.getGroupValues(group);
  }

  @Post()
  @ApiOperation({ summary: '创建配置' })
  @ApiResponse({ status: 201, description: '创建成功' })
  async create(@Body() data: CreateSystemConfigDto) {
    return this.configService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新配置' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async update(@Param('id') id: string, @Body() data: UpdateSystemConfigDto) {
    return this.configService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除配置' })
  @ApiResponse({ status: 200, description: '删除成功' })
  async remove(@Param('id') id: string) {
    return this.configService.remove(id);
  }

  @Post('cache/clear')
  @ApiOperation({ summary: '清除配置缓存' })
  @ApiResponse({ status: 200, description: '清除成功' })
  async clearCache() {
    return this.configService.clearCache();
  }
}