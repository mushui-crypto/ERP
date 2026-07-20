import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayableService } from './payable.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreatePayableDto, UpdatePayableDto, MakePaymentDto } from './dto/payable.dto';

@ApiTags('应付账款')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payables')
export class PayableController {
  constructor(private readonly payableService: PayableService) {}

  @Get()
  @ApiOperation({ summary: '获取应付账款列表' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('supplierId') supplierId?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.payableService.findAll(pageNum, pageSizeNum, supplierId, status ? Number(status) : undefined);
  }

  @Get('summary')
  @ApiOperation({ summary: '应付账款汇总' })
  async getSummary(@Query('supplierId') supplierId?: string) {
    return this.payableService.getSummary(supplierId);
  }

  @Get('overdue')
  @ApiOperation({ summary: '逾期应付账款列表' })
  async getOverdueList() {
    return this.payableService.getOverdueList();
  }

  @Get('supplier/:supplierId')
  @ApiOperation({ summary: '按供应商查询应付账款' })
  async findBySupplierId(@Param('supplierId') supplierId: string) {
    return this.payableService.findBySupplierId(supplierId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取应付账款详情' })
  async findOne(@Param('id') id: string) {
    return this.payableService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建应付账款' })
  async create(@Body() dto: CreatePayableDto) {
    return this.payableService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新应付账款' })
  async update(@Param('id') id: string, @Body() dto: UpdatePayableDto) {
    return this.payableService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除应付账款' })
  async remove(@Param('id') id: string) {
    await this.payableService.remove(id);
    return null;
  }

  @Post(':id/pay')
  @ApiOperation({ summary: '付款' })
  async makePayment(@Param('id') id: string, @Body() dto: MakePaymentDto) {
    return this.payableService.makePayment(id, dto);
  }
}