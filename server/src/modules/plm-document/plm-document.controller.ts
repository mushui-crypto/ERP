import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlmDocumentService } from './plm-document.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('PLM文档管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plm-documents')
export class PlmDocumentController {
  constructor(private readonly documentService: PlmDocumentService) {}

  @Get()
  @ApiOperation({ summary: '获取PLM文档列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.documentService.findAll(pageNum, pageSizeNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取PLM文档详情' })
  async findOne(@Param('id') id: string) {
    return this.documentService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建PLM文档' })
  async create(@Body() data: any) {
    return this.documentService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新PLM文档' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.documentService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除PLM文档' })
  async remove(@Param('id') id: string) {
    await this.documentService.remove(id);
    return null;
  }
}
