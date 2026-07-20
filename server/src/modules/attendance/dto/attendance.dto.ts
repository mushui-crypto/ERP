import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class AttendanceDto {
  @ApiProperty({ description: '员工ID', required: false })
  @IsOptional()
  @IsString()
  empId?: string;

  @ApiProperty({ description: '考勤日期', required: false })
  @IsOptional()
  @IsString()
  attendDate?: string;

  @ApiProperty({ description: '上班打卡时间', required: false })
  @IsOptional()
  @IsString()
  clockIn?: string;

  @ApiProperty({ description: '下班打卡时间', required: false })
  @IsOptional()
  @IsString()
  clockOut?: string;

  @ApiProperty({ description: '工作时长', required: false })
  @IsOptional()
  @IsNumber()
  workHours?: number;

  @ApiProperty({ description: '加班时长', required: false })
  @IsOptional()
  @IsNumber()
  overtimeHours?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreateAttendanceDto extends AttendanceDto {
  @ApiProperty({ description: '员工ID', required: true })
  @IsString()
  empId: string;

  @ApiProperty({ description: '考勤日期', required: true })
  @IsString()
  attendDate: string;
}

export class UpdateAttendanceDto extends AttendanceDto {}

export class ClockInDto {
  @ApiProperty({ description: '员工ID', required: true })
  @IsString()
  empId: string;
}

export class ClockOutDto {
  @ApiProperty({ description: '员工ID', required: true })
  @IsString()
  empId: string;
}