import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, MaxLength } from 'class-validator';

export class CreateDepartmentDto {
  @IsNotEmpty({ message: '部门编码不能为空' })
  @IsString({ message: '部门编码必须为字符串' })
  @MaxLength(50, { message: '部门编码长度不能超过50' })
  deptCode: string;

  @IsNotEmpty({ message: '部门名称不能为空' })
  @IsString({ message: '部门名称必须为字符串' })
  @MaxLength(100, { message: '部门名称长度不能超过100' })
  deptName: string;

  @IsOptional()
  @IsString({ message: '父级部门ID必须为字符串' })
  parentId?: string;

  @IsOptional()
  @IsString({ message: '部门负责人ID必须为字符串' })
  managerId?: string;

  @IsOptional()
  @IsString({ message: '电话必须为字符串' })
  @MaxLength(20, { message: '电话长度不能超过20' })
  phone?: string;

  @IsOptional()
  @IsString({ message: '邮箱必须为字符串' })
  @MaxLength(100, { message: '邮箱长度不能超过100' })
  email?: string;

  @IsOptional()
  @IsNumber({}, { message: '排序必须为数字' })
  sortOrder?: number;

  @IsOptional()
  @IsNumber({}, { message: '状态必须为数字' })
  status?: number;

  @IsOptional()
  @IsString({ message: '备注必须为字符串' })
  remark?: string;
}

export class UpdateDepartmentDto {
  @IsOptional()
  @IsString({ message: '部门名称必须为字符串' })
  @MaxLength(100, { message: '部门名称长度不能超过100' })
  deptName?: string;

  @IsOptional()
  @IsString({ message: '父级部门ID必须为字符串' })
  parentId?: string;

  @IsOptional()
  @IsString({ message: '部门负责人ID必须为字符串' })
  managerId?: string;

  @IsOptional()
  @IsString({ message: '电话必须为字符串' })
  @MaxLength(20, { message: '电话长度不能超过20' })
  phone?: string;

  @IsOptional()
  @IsString({ message: '邮箱必须为字符串' })
  @MaxLength(100, { message: '邮箱长度不能超过100' })
  email?: string;

  @IsOptional()
  @IsNumber({}, { message: '排序必须为数字' })
  sortOrder?: number;

  @IsOptional()
  @IsNumber({}, { message: '状态必须为数字' })
  status?: number;

  @IsOptional()
  @IsString({ message: '备注必须为字符串' })
  remark?: string;
}