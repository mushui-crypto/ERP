import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class EmployeeDto {
  @ApiProperty({ description: '员工编码', required: false })
  @IsOptional()
  @IsString()
  empCode?: string;

  @ApiProperty({ description: '员工姓名', required: false })
  @IsOptional()
  @IsString()
  empName?: string;

  @ApiProperty({ description: '性别: 0-未知 1-男 2-女', required: false })
  @IsOptional()
  @IsNumber()
  gender?: number;

  @ApiProperty({ description: '出生日期', required: false })
  @IsOptional()
  @IsString()
  birthDate?: string;

  @ApiProperty({ description: '身份证号', required: false })
  @IsOptional()
  @IsString()
  idCard?: string;

  @ApiProperty({ description: '电话', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ description: '部门ID', required: false })
  @IsOptional()
  @IsString()
  deptId?: string;

  @ApiProperty({ description: '岗位ID', required: false })
  @IsOptional()
  @IsString()
  positionId?: string;

  @ApiProperty({ description: '入职日期', required: false })
  @IsOptional()
  @IsString()
  hireDate?: string;

  @ApiProperty({ description: '离职日期', required: false })
  @IsOptional()
  @IsString()
  leaveDate?: string;

  @ApiProperty({ description: '状态: 1-在职 0-离职', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreateEmployeeDto extends EmployeeDto {
  @ApiProperty({ description: '员工编码', required: true })
  @IsString()
  empCode: string;

  @ApiProperty({ description: '员工姓名', required: true })
  @IsString()
  empName: string;

  @ApiProperty({ description: '入职日期', required: true })
  @IsString()
  hireDate: string;
}

export class UpdateEmployeeDto extends EmployeeDto {}

export class EmployeeLeaveDto {
  @ApiProperty({ description: '离职日期', required: true })
  @IsString()
  leaveDate: string;

  @ApiProperty({ description: '离职原因', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}