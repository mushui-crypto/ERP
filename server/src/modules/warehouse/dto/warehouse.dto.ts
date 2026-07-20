﻿import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, MaxLength } from 'class-validator';

export class CreateWarehouseDto {
  @IsNotEmpty({ message: '仓库编码不能为空' })
  @IsString({ message: '仓库编码必须为字符串' })
  @MaxLength(50, { message: '仓库编码长度不能超过50' })
  warehouseCode: string;

  @IsNotEmpty({ message: '仓库名称不能为空' })
  @IsString({ message: '仓库名称必须为字符串' })
  @MaxLength(100, { message: '仓库名称长度不能超过100' })
  warehouseName: string;

  @IsOptional()
  @IsNumber({}, { message: '仓库类型必须为数字' })
  warehouseType?: number;

  @IsOptional()
  @IsString({ message: '父级仓库ID必须为字符串' })
  parentId?: string;

  @IsOptional()
  @IsString({ message: '仓库管理员ID必须为字符串' })
  managerId?: string;

  @IsOptional()
  @IsString({ message: '地址必须为字符串' })
  @MaxLength(200, { message: '地址长度不能超过200' })
  address?: string;

  @IsOptional()
  @IsNumber()
  isDefault?: number;

  @IsOptional()
  @IsNumber({}, { message: '状态必须为数字' })
  status?: number;

  @IsOptional()
  @IsString({ message: '备注必须为字符串' })
  remark?: string;
}

export class UpdateWarehouseDto {
  @IsOptional()
  @IsString({ message: '仓库名称必须为字符串' })
  @MaxLength(100, { message: '仓库名称长度不能超过100' })
  warehouseName?: string;

  @IsOptional()
  @IsNumber({}, { message: '仓库类型必须为数字' })
  warehouseType?: number;

  @IsOptional()
  @IsString({ message: '父级仓库ID必须为字符串' })
  parentId?: string;

  @IsOptional()
  @IsString({ message: '仓库管理员ID必须为字符串' })
  managerId?: string;

  @IsOptional()
  @IsString({ message: '地址必须为字符串' })
  @MaxLength(200, { message: '地址长度不能超过200' })
  address?: string;

  @IsOptional()
  @IsNumber()
  isDefault?: number;

  @IsOptional()
  @IsNumber({}, { message: '状态必须为数字' })
  status?: number;

  @IsOptional()
  @IsString({ message: '备注必须为字符串' })
  remark?: string;
}