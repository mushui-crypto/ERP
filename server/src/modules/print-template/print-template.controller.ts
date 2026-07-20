import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrintTemplateService } from './print-template.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('套打模板管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('print-templates')
export class PrintTemplateController {
  constructor(private readonly printTemplateService: PrintTemplateService) {}

  @Get()
  @ApiOperation({ summary: '获取套打模板列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.printTemplateService.findAll(pageNum, pageSizeNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取套打模板详情' })
  async findOne(@Param('id') id: string) {
    return this.printTemplateService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建套打模板' })
  async create(@Body() data: any) {
    return this.printTemplateService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新套打模板' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.printTemplateService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除套打模板' })
  async remove(@Param('id') id: string) {
    await this.printTemplateService.remove(id);
    return null;
  }
}
