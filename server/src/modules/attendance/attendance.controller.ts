import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateAttendanceDto, UpdateAttendanceDto } from './dto/attendance.dto';

@ApiTags('考勤管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('attendances')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @ApiOperation({ summary: '获取考勤记录列表' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('empId') empId?: string,
    @Query('attendDate') attendDate?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.attendanceService.findAll(pageNum, pageSizeNum, empId, attendDate);
  }

  @Get('summary')
  @ApiOperation({ summary: '考勤统计汇总' })
  async getAttendanceSummary(@Query('empId') empId?: string, @Query('period') period?: string) {
    return this.attendanceService.getAttendanceSummary(empId, period);
  }

  @Get('employee/:empId')
  @ApiOperation({ summary: '按员工查询考勤记录' })
  async findByEmpId(@Param('empId') empId: string) {
    return this.attendanceService.findByEmpId(empId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取考勤记录详情' })
  async findOne(@Param('id') id: string) {
    return this.attendanceService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建考勤记录' })
  async create(@Body() dto: CreateAttendanceDto) {
    return this.attendanceService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新考勤记录' })
  async update(@Param('id') id: string, @Body() dto: UpdateAttendanceDto) {
    return this.attendanceService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除考勤记录' })
  async remove(@Param('id') id: string) {
    await this.attendanceService.remove(id);
    return null;
  }

  @Post(':empId/clock-in')
  @ApiOperation({ summary: '上班打卡' })
  async clockIn(@Param('empId') empId: string) {
    return this.attendanceService.clockIn(empId);
  }

  @Post(':empId/clock-out')
  @ApiOperation({ summary: '下班打卡' })
  async clockOut(@Param('empId') empId: string) {
    return this.attendanceService.clockOut(empId);
  }
}