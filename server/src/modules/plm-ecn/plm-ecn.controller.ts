import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PlmEcnService } from './plm-ecn.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('PLM变更管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('plm-ecns')
export class PlmEcnController {
  constructor(private readonly ecnService: PlmEcnService) {}

  @Get()
  @ApiOperation({ summary: '获取PLM变更单列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.ecnService.findAll(pageNum, pageSizeNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取PLM变更单详情' })
  async findOne(@Param('id') id: string) {
    return this.ecnService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建PLM变更单' })
  async create(@Body() data: any) {
    return this.ecnService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新PLM变更单' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.ecnService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除PLM变更单' })
  async remove(@Param('id') id: string) {
    await this.ecnService.remove(id);
    return null;
  }
}
