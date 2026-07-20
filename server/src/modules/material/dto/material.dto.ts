﻿import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, MinLength, MaxLength } from 'class-validator';

export class MaterialDto {
  @ApiProperty({ description: '物料编码', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  materialCode?: string;

  @ApiProperty({ description: '物料名称', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  materialName?: string;

  @ApiProperty({ description: '规格型号', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  materialSpec?: string;

  @ApiProperty({ description: '分类ID', required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ description: '基本单位ID', required: false })
  @IsOptional()
  @IsString()
  unitId?: string;

  @ApiProperty({ description: '物料属性: 1-自制 2-采购 3-委外 4-虚拟', required: false })
  @IsOptional()
  @IsNumber()
  materialType?: number;

  @ApiProperty({ description: '采购类型: 1-外购 2-自制 3-委外', required: false })
  @IsOptional()
  @IsNumber()
  purchaseType?: number;

  @ApiProperty({ description: '条形码', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  barcode?: string;

  @ApiProperty({ description: '默认仓库', required: false })
  @IsOptional()
  @IsString()
  defaultWarehouse?: string;

  @ApiProperty({ description: '安全库存', required: false })
  @IsOptional()
  @IsNumber()
  safetyStock?: number;

  @ApiProperty({ description: '最小订货量', required: false })
  @IsOptional()
  @IsNumber()
  minOrderQty?: number;

  @ApiProperty({ description: '采购提前期(天)', required: false })
  @IsOptional()
  @IsNumber()
  leadTime?: number;

  @ApiProperty({ description: '标准成本', required: false })
  @IsOptional()
  @IsNumber()
  standardCost?: number;

  @ApiProperty({ description: '销售单价', required: false })
  @IsOptional()
  @IsNumber()
  salePrice?: number;

  @ApiProperty({ description: '是否批次管理', required: false })
  @IsOptional()
  @IsNumber()
  isBatchManage?: number;

  @ApiProperty({ description: '是否序列号管理', required: false })
  @IsOptional()
  @IsNumber()
  isSerialManage?: number;

  @ApiProperty({ description: '保质期天数', required: false })
  @IsOptional()
  @IsNumber()
  shelfLifeDays?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;

  @ApiProperty({ description: '状态: 1-启用 0-禁用', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;
}

export class CreateMaterialDto extends MaterialDto {
  @ApiProperty({ description: '物料编码', required: true })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  materialCode: string;

  @ApiProperty({ description: '物料名称', required: true })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  materialName: string;
}

export class UpdateMaterialDto extends MaterialDto {}