﻿import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, MaxLength } from 'class-validator';

export class CreateSystemConfigDto {
  @IsNotEmpty({ message: '配置分组不能为空' })
  @IsString({ message: '配置分组必须为字符串' })
  @MaxLength(50, { message: '配置分组长度不能超过50' })
  configGroup: string;

  @IsNotEmpty({ message: '配置键不能为空' })
  @IsString({ message: '配置键必须为字符串' })
  @MaxLength(100, { message: '配置键长度不能超过100' })
  configKey: string;

  @IsNotEmpty({ message: '配置名称不能为空' })
  @IsString({ message: '配置名称必须为字符串' })
  @MaxLength(200, { message: '配置名称长度不能超过200' })
  configName: string;

  @IsOptional()
  @IsString({ message: '配置值必须为字符串' })
  configValue?: string;

  @IsOptional()
  @IsString({ message: '值类型必须为字符串' })
  @MaxLength(20, { message: '值类型长度不能超过20' })
  valueType?: string;

  @IsOptional()
  @IsString({ message: '描述必须为字符串' })
  @MaxLength(500, { message: '描述长度不能超过500' })
  description?: string;

  @IsOptional()
  @IsNumber()
  isEditable?: number;

  @IsOptional()
  @IsNumber({}, { message: '状态必须为数字' })
  status?: number;

  @IsOptional()
  @IsNumber({}, { message: '排序必须为数字' })
  sortOrder?: number;
}

export class UpdateSystemConfigDto {
  @IsOptional()
  @IsString({ message: '配置名称必须为字符串' })
  @MaxLength(200, { message: '配置名称长度不能超过200' })
  configName?: string;

  @IsOptional()
  @IsString({ message: '配置值必须为字符串' })
  configValue?: string;

  @IsOptional()
  @IsString({ message: '值类型必须为字符串' })
  @MaxLength(20, { message: '值类型长度不能超过20' })
  valueType?: string;

  @IsOptional()
  @IsString({ message: '描述必须为字符串' })
  @MaxLength(500, { message: '描述长度不能超过500' })
  description?: string;

  @IsOptional()
  @IsNumber()
  isEditable?: number;

  @IsOptional()
  @IsNumber({}, { message: '状态必须为数字' })
  status?: number;

  @IsOptional()
  @IsNumber({}, { message: '排序必须为数字' })
  sortOrder?: number;
}