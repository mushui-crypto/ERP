import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReceivableService } from './receivable.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateReceivableDto, UpdateReceivableDto, ReceivePaymentDto } from './dto/receivable.dto';

@ApiTags('应收账款')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('receivables')
export class ReceivableController {
  constructor(private readonly receivableService: ReceivableService) {}

  @Get()
  @ApiOperation({ summary: '获取应收账款列表' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.receivableService.findAll(pageNum, pageSizeNum, customerId, status ? Number(status) : undefined);
  }

  @Get('summary')
  @ApiOperation({ summary: '应收账款汇总' })
  async getSummary(@Query('customerId') customerId?: string) {
    return this.receivableService.getSummary(customerId);
  }

  @Get('overdue')
  @ApiOperation({ summary: '逾期应收账款列表' })
  async getOverdueList() {
    return this.receivableService.getOverdueList();
  }

  @Get('customer/:customerId')
  @ApiOperation({ summary: '按客户查询应收账款' })
  async findByCustomerId(@Param('customerId') customerId: string) {
    return this.receivableService.findByCustomerId(customerId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取应收账款详情' })
  async findOne(@Param('id') id: string) {
    return this.receivableService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建应收账款' })
  async create(@Body() dto: CreateReceivableDto) {
    return this.receivableService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新应收账款' })
  async update(@Param('id') id: string, @Body() dto: UpdateReceivableDto) {
    return this.receivableService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除应收账款' })
  async remove(@Param('id') id: string) {
    await this.receivableService.remove(id);
    return null;
  }

  @Post(':id/receive')
  @ApiOperation({ summary: '收款' })
  async receivePayment(@Param('id') id: string, @Body() dto: ReceivePaymentDto) {
    return this.receivableService.receivePayment(id, dto);
  }
}