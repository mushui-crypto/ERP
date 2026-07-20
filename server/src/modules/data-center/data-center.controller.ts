import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DataCenterService } from './data-center.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateDataCenterDto, UpdateDataCenterDto } from './dto/data-center.dto';

@ApiTags('数据中心')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('data-centers')
export class DataCenterController {
  constructor(private readonly dataCenterService: DataCenterService) {}

  @Get()
  @ApiOperation({ summary: '获取数据中心列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.dataCenterService.findAll(pageNum, pageSizeNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取数据中心详情' })
  async findOne(@Param('id') id: string) {
    return this.dataCenterService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建数据中心（自动创建数据库和表结构）' })
  async create(@Body() dto: CreateDataCenterDto) {
    return this.dataCenterService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新数据中心' })
  async update(@Param('id') id: string, @Body() dto: UpdateDataCenterDto) {
    return this.dataCenterService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除数据中心' })
  async remove(@Param('id') id: string) {
    await this.dataCenterService.remove(id);
    return { code: 200, message: '删除成功' };
  }

  @Post(':id/test-connection')
  @ApiOperation({ summary: '测试数据库连接（已保存的数据中心）' })
  async testConnection(@Param('id') id: string) {
    return this.dataCenterService.testConnection(id);
  }

  @Post('test-connection-before-save')
  @ApiOperation({ summary: '保存前测试数据库连接' })
  async testConnectionBeforeSave(@Body() dto: CreateDataCenterDto) {
    return this.dataCenterService.testConnectionBeforeSave(dto);
  }

  @Get('stats/connections')
  @ApiOperation({ summary: '获取连接池统计' })
  async getConnectionStats() {
    return this.dataCenterService.getConnectionStats();
  }
}