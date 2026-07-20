﻿import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, MaxLength } from 'class-validator';

export class CreateMetaFieldDto {
  @IsNotEmpty({ message: '所属实体ID不能为空' })
  @IsString({ message: '所属实体ID必须为字符串' })
  entityId: string;

  @IsNotEmpty({ message: '字段编码不能为空' })
  @IsString({ message: '字段编码必须为字符串' })
  @MaxLength(50, { message: '字段编码长度不能超过50' })
  fieldCode: string;

  @IsNotEmpty({ message: '字段名称不能为空' })
  @IsString({ message: '字段名称必须为字符串' })
  @MaxLength(200, { message: '字段名称长度不能超过200' })
  fieldName: string;

  @IsNotEmpty({ message: '字段类型不能为空' })
  @IsString({ message: '字段类型必须为字符串' })
  @MaxLength(50, { message: '字段类型长度不能超过50' })
  fieldType: string;

  @IsOptional()
  @IsNumber({}, { message: '字段长度必须为数字' })
  fieldLength?: number;

  @IsOptional()
  @IsNumber()
  isRequired?: number;

  @IsOptional()
  @IsNumber()
  isUnique?: number;

  @IsOptional()
  @IsNumber()
  isSearchable?: number;

  @IsOptional()
  @IsNumber()
  isListVisible?: number;

  @IsOptional()
  @IsString({ message: '默认值必须为字符串' })
  @MaxLength(200, { message: '默认值长度不能超过200' })
  defaultValue?: string;

  @IsOptional()
  @IsString({ message: '字典编码必须为字符串' })
  @MaxLength(50, { message: '字典编码长度不能超过50' })
  dictCode?: string;

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

export class UpdateMetaFieldDto {
  @IsOptional()
  @IsString({ message: '字段名称必须为字符串' })
  @MaxLength(200, { message: '字段名称长度不能超过200' })
  fieldName?: string;

  @IsOptional()
  @IsString({ message: '字段类型必须为字符串' })
  @MaxLength(50, { message: '字段类型长度不能超过50' })
  fieldType?: string;

  @IsOptional()
  @IsNumber({}, { message: '字段长度必须为数字' })
  fieldLength?: number;

  @IsOptional()
  @IsNumber()
  isRequired?: number;

  @IsOptional()
  @IsNumber()
  isUnique?: number;

  @IsOptional()
  @IsNumber()
  isSearchable?: number;

  @IsOptional()
  @IsNumber()
  isListVisible?: number;

  @IsOptional()
  @IsString({ message: '默认值必须为字符串' })
  @MaxLength(200, { message: '默认值长度不能超过200' })
  defaultValue?: string;

  @IsOptional()
  @IsString({ message: '字典编码必须为字符串' })
  @MaxLength(50, { message: '字典编码长度不能超过50' })
  dictCode?: string;

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