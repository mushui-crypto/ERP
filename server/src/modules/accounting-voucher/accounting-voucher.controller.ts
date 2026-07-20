import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AccountingVoucherService } from './accounting-voucher.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('会计凭证')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('accounting-vouchers')
export class AccountingVoucherController {
  constructor(private readonly voucherService: AccountingVoucherService) {}

  @Get()
  @ApiOperation({ summary: '获取会计凭证列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.voucherService.findAll(pageNum, pageSizeNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取会计凭证详情' })
  async findOne(@Param('id') id: string) {
    return this.voucherService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建会计凭证' })
  async create(@Body() data: any) {
    return this.voucherService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新会计凭证' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.voucherService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除会计凭证' })
  async remove(@Param('id') id: string) {
    await this.voucherService.remove(id);
    return null;
  }
}
