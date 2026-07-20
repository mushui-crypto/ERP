import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, MaxLength } from 'class-validator';

export class CreateDictTypeDto {
  @IsNotEmpty({ message: '字典编码不能为空' })
  @IsString({ message: '字典编码必须为字符串' })
  @MaxLength(50, { message: '字典编码长度不能超过50' })
  dictCode: string;

  @IsNotEmpty({ message: '字典名称不能为空' })
  @IsString({ message: '字典名称必须为字符串' })
  @MaxLength(200, { message: '字典名称长度不能超过200' })
  dictName: string;

  @IsOptional()
  @IsString({ message: '描述必须为字符串' })
  @MaxLength(500, { message: '描述长度不能超过500' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: '状态必须为数字' })
  status?: number;

  @IsOptional()
  @IsNumber({}, { message: '排序必须为数字' })
  sortOrder?: number;

  @IsOptional()
  @IsString({ message: '备注必须为字符串' })
  remark?: string;
}

export class UpdateDictTypeDto {
  @IsOptional()
  @IsString({ message: '字典名称必须为字符串' })
  @MaxLength(200, { message: '字典名称长度不能超过200' })
  dictName?: string;

  @IsOptional()
  @IsString({ message: '描述必须为字符串' })
  @MaxLength(500, { message: '描述长度不能超过500' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: '状态必须为数字' })
  status?: number;

  @IsOptional()
  @IsNumber({}, { message: '排序必须为数字' })
  sortOrder?: number;

  @IsOptional()
  @IsString({ message: '备注必须为字符串' })
  remark?: string;
}