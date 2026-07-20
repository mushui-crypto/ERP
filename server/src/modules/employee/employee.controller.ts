import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmployeeService } from './employee.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeLeaveDto } from './dto/employee.dto';

@ApiTags('员工管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Get()
  @ApiOperation({ summary: '获取员工列表' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('deptId') deptId?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.employeeService.findAll(pageNum, pageSizeNum, deptId, status ? Number(status) : undefined);
  }

  @Get('summary')
  @ApiOperation({ summary: '员工统计汇总' })
  async getStatusSummary() {
    return this.employeeService.getStatusSummary();
  }

  @Get('generate-code')
  @ApiOperation({ summary: '生成员工编码' })
  async generateEmpCode() {
    return { empCode: await this.employeeService.generateEmpCode() };
  }

  @Get('dept/:deptId')
  @ApiOperation({ summary: '按部门查询员工' })
  async findByDeptId(@Param('deptId') deptId: string) {
    return this.employeeService.findByDeptId(deptId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取员工详情' })
  async findOne(@Param('id') id: string) {
    return this.employeeService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建员工' })
  async create(@Body() dto: CreateEmployeeDto) {
    return this.employeeService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新员工' })
  async update(@Param('id') id: string, @Body() dto: UpdateEmployeeDto) {
    return this.employeeService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除员工' })
  async remove(@Param('id') id: string) {
    await this.employeeService.remove(id);
    return null;
  }

  @Post(':id/leave')
  @ApiOperation({ summary: '办理离职' })
  async leave(@Param('id') id: string, @Body() dto: EmployeeLeaveDto) {
    return this.employeeService.leave(id, dto);
  }
}