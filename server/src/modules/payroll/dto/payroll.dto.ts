import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class PayrollDto {
  @ApiProperty({ description: '员工ID', required: false })
  @IsOptional()
  @IsString()
  empId?: string;

  @ApiProperty({ description: '薪酬周期，如2026-07', required: false })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiProperty({ description: '基本工资', required: false })
  @IsOptional()
  @IsNumber()
  basicSalary?: number;

  @ApiProperty({ description: '加班费', required: false })
  @IsOptional()
  @IsNumber()
  overtimePay?: number;

  @ApiProperty({ description: '奖金', required: false })
  @IsOptional()
  @IsNumber()
  bonus?: number;

  @ApiProperty({ description: '扣款', required: false })
  @IsOptional()
  @IsNumber()
  deduction?: number;

  @ApiProperty({ description: '社保', required: false })
  @IsOptional()
  @IsNumber()
  socialInsurance?: number;

  @ApiProperty({ description: '个税', required: false })
  @IsOptional()
  @IsNumber()
  tax?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreatePayrollDto extends PayrollDto {
  @ApiProperty({ description: '员工ID', required: true })
  @IsString()
  empId: string;

  @ApiProperty({ description: '薪酬周期', required: true })
  @IsString()
  period: string;

  @ApiProperty({ description: '基本工资', required: true })
  @IsNumber()
  basicSalary: number;
}

export class UpdatePayrollDto extends PayrollDto {}

export class CalculatePayrollDto {
  @ApiProperty({ description: '员工ID', required: true })
  @IsString()
  empId: string;

  @ApiProperty({ description: '薪酬周期', required: true })
  @IsString()
  period: string;
}