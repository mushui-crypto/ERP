import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, MaxLength } from 'class-validator';

export class CreateMetaEntityDto {
  @IsNotEmpty({ message: '实体编码不能为空' })
  @IsString({ message: '实体编码必须为字符串' })
  @MaxLength(50, { message: '实体编码长度不能超过50' })
  entityCode: string;

  @IsNotEmpty({ message: '实体名称不能为空' })
  @IsString({ message: '实体名称必须为字符串' })
  @MaxLength(200, { message: '实体名称长度不能超过200' })
  entityName: string;

  @IsNotEmpty({ message: '表名不能为空' })
  @IsString({ message: '表名必须为字符串' })
  @MaxLength(100, { message: '表名长度不能超过100' })
  tableName: string;

  @IsOptional()
  @IsString({ message: '描述必须为字符串' })
  @MaxLength(500, { message: '描述长度不能超过500' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: '状态必须为数字' })
  status?: number;

  @IsOptional()
  @IsString({ message: '备注必须为字符串' })
  remark?: string;
}

export class UpdateMetaEntityDto {
  @IsOptional()
  @IsString({ message: '实体名称必须为字符串' })
  @MaxLength(200, { message: '实体名称长度不能超过200' })
  entityName?: string;

  @IsOptional()
  @IsString({ message: '表名必须为字符串' })
  @MaxLength(100, { message: '表名长度不能超过100' })
  tableName?: string;

  @IsOptional()
  @IsString({ message: '描述必须为字符串' })
  @MaxLength(500, { message: '描述长度不能超过500' })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: '状态必须为数字' })
  status?: number;

  @IsOptional()
  @IsString({ message: '备注必须为字符串' })
  remark?: string;
}