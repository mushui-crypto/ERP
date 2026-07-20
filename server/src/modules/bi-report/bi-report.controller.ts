import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BiReportService } from './bi-report.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('BI报表')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('bi-reports')
export class BiReportController {
  constructor(private readonly biReportService: BiReportService) {}

  @Get()
  @ApiOperation({ summary: '获取BI报表列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.biReportService.findAll(pageNum, pageSizeNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取BI报表详情' })
  async findOne(@Param('id') id: string) {
    return this.biReportService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建BI报表' })
  async create(@Body() data: any) {
    return this.biReportService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新BI报表' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.biReportService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除BI报表' })
  async remove(@Param('id') id: string) {
    await this.biReportService.remove(id);
    return null;
  }
}
