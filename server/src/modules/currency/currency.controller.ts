import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CurrencyService } from './currency.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('币种管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('currencies')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get()
  @ApiOperation({ summary: '获取币种列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.currencyService.findAll(pageNum, pageSizeNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取币种详情' })
  async findOne(@Param('id') id: string) {
    return this.currencyService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建币种' })
  async create(@Body() data: any) {
    return this.currencyService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新币种' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.currencyService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除币种' })
  async remove(@Param('id') id: string) {
    await this.currencyService.remove(id);
    return null;
  }
}
