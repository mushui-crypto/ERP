import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PayrollService } from './payroll.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreatePayrollDto, UpdatePayrollDto, CalculatePayrollDto } from './dto/payroll.dto';

@ApiTags('薪酬管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('payrolls')
export class PayrollController {
  constructor(private readonly payrollService: PayrollService) {}

  @Get()
  @ApiOperation({ summary: '获取薪酬记录列表' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('empId') empId?: string,
    @Query('period') period?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.payrollService.findAll(pageNum, pageSizeNum, empId, period);
  }

  @Get('summary')
  @ApiOperation({ summary: '薪酬统计汇总' })
  async getPeriodSummary(@Query('period') period: string) {
    return this.payrollService.getPeriodSummary(period);
  }

  @Get('employee/:empId')
  @ApiOperation({ summary: '按员工查询薪酬记录' })
  async findByEmpId(@Param('empId') empId: string) {
    return this.payrollService.findByEmpId(empId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取薪酬记录详情' })
  async findOne(@Param('id') id: string) {
    return this.payrollService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建薪酬记录' })
  async create(@Body() dto: CreatePayrollDto) {
    return this.payrollService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新薪酬记录' })
  async update(@Param('id') id: string, @Body() dto: UpdatePayrollDto) {
    return this.payrollService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除薪酬记录' })
  async remove(@Param('id') id: string) {
    await this.payrollService.remove(id);
    return null;
  }

  @Post('calculate')
  @ApiOperation({ summary: '计算薪酬' })
  async calculatePayroll(@Body() dto: CalculatePayrollDto) {
    return this.payrollService.calculatePayroll(dto);
  }

  @Post(':id/approve')
  @ApiOperation({ summary: '审核薪酬' })
  async approve(@Param('id') id: string) {
    return this.payrollService.approve(id);
  }

  @Post(':id/pay')
  @ApiOperation({ summary: '发放薪酬' })
  async pay(@Param('id') id: string) {
    return this.payrollService.pay(id);
  }

  @Post('batch-approve')
  @ApiOperation({ summary: '批量审核薪酬' })
  async batchApprove(@Body() body: { ids: string[] }) {
    return this.payrollService.batchApprove(body.ids);
  }
}