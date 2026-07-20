import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, MaxLength } from 'class-validator';

export class CreateUnitDto {
  @IsNotEmpty({ message: '计量单位编码不能为空' })
  @IsString({ message: '计量单位编码必须为字符串' })
  @MaxLength(50, { message: '计量单位编码长度不能超过50' })
  unitCode: string;

  @IsNotEmpty({ message: '计量单位名称不能为空' })
  @IsString({ message: '计量单位名称必须为字符串' })
  @MaxLength(100, { message: '计量单位名称长度不能超过100' })
  unitName: string;

  @IsOptional()
  @IsNumber({}, { message: '单位类型必须为数字' })
  unitType?: number;

  @IsOptional()
  @IsNumber({}, { message: '精度必须为数字' })
  precision?: number;

  @IsOptional()
  @IsNumber({}, { message: '状态必须为数字' })
  status?: number;

  @IsOptional()
  @IsString({ message: '备注必须为字符串' })
  remark?: string;
}

export class UpdateUnitDto {
  @IsOptional()
  @IsString({ message: '计量单位名称必须为字符串' })
  @MaxLength(100, { message: '计量单位名称长度不能超过100' })
  unitName?: string;

  @IsOptional()
  @IsNumber({}, { message: '单位类型必须为数字' })
  unitType?: number;

  @IsOptional()
  @IsNumber({}, { message: '精度必须为数字' })
  precision?: number;

  @IsOptional()
  @IsNumber({}, { message: '状态必须为数字' })
  status?: number;

  @IsOptional()
  @IsString({ message: '备注必须为字符串' })
  remark?: string;
}