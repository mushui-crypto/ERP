import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, MaxLength } from 'class-validator';

export class CreateDictDataDto {
  @IsNotEmpty({ message: '字典编码不能为空' })
  @IsString({ message: '字典编码必须为字符串' })
  @MaxLength(50, { message: '字典编码长度不能超过50' })
  dictCode: string;

  @IsNotEmpty({ message: '字典值不能为空' })
  @IsString({ message: '字典值必须为字符串' })
  @MaxLength(200, { message: '字典值长度不能超过200' })
  dictValue: string;

  @IsNotEmpty({ message: '字典标签不能为空' })
  @IsString({ message: '字典标签必须为字符串' })
  @MaxLength(200, { message: '字典标签长度不能超过200' })
  dictLabel: string;

  @IsOptional()
  @IsString({ message: '父级值必须为字符串' })
  @MaxLength(200, { message: '父级值长度不能超过200' })
  parentValue?: string;

  @IsOptional()
  @IsNumber({}, { message: '层级必须为数字' })
  level?: number;

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

export class UpdateDictDataDto {
  @IsOptional()
  @IsString({ message: '字典标签必须为字符串' })
  @MaxLength(200, { message: '字典标签长度不能超过200' })
  dictLabel?: string;

  @IsOptional()
  @IsString({ message: '父级值必须为字符串' })
  @MaxLength(200, { message: '父级值长度不能超过200' })
  parentValue?: string;

  @IsOptional()
  @IsNumber({}, { message: '层级必须为数字' })
  level?: number;

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