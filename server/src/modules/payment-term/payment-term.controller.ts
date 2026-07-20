import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentTermService } from './payment-term.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('付款条件管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payment-terms')
export class PaymentTermController {
  constructor(private readonly paymentTermService: PaymentTermService) {}

  @Get()
  @ApiOperation({ summary: '获取付款条件列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.paymentTermService.findAll(pageNum, pageSizeNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取付款条件详情' })
  async findOne(@Param('id') id: string) {
    return this.paymentTermService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建付款条件' })
  async create(@Body() data: any) {
    return this.paymentTermService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新付款条件' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.paymentTermService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除付款条件' })
  async remove(@Param('id') id: string) {
    await this.paymentTermService.remove(id);
    return null;
  }
}
