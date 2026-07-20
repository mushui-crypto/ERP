import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { PurchaseReturnMode } from '../../purchase-common/purchase-status';

export class PurchaseReturnInboundLineDto {
  @ApiProperty({ description: '来源采购入库明细ID' })
  @IsString()
  inventoryInEntryId: string;

  @ApiProperty({ description: '退料数量', minimum: 0.0001 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  quantity: number;

  @ApiPropertyOptional({ description: '行备注', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

export class CreatePurchaseReturnFromInboundDto {
  @ApiProperty({ description: '来源采购入库单ID' })
  @IsString()
  inventoryInId: string;

  @ApiProperty({ description: '下推幂等键', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  idempotencyKey: string;

  @ApiProperty({ enum: PurchaseReturnMode, description: '退料方式' })
  @IsEnum(PurchaseReturnMode)
  returnMode: PurchaseReturnMode;

  @ApiProperty({ description: '退料原因', maxLength: 500 })
  @IsString()
  @MaxLength(500)
  reason: string;

  @ApiPropertyOptional({ description: '退料日期，ISO 8601' })
  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @ApiPropertyOptional({ description: '备注', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remark?: string;

  @ApiProperty({ type: [PurchaseReturnInboundLineDto], description: '退料明细' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseReturnInboundLineDto)
  lines: PurchaseReturnInboundLineDto[];
}

export class PurchaseReturnRequestLineDto {
  @ApiProperty({ description: '来源退料申请明细ID' })
  @IsString()
  returnRequestEntryId: string;

  @ApiProperty({ description: '退料数量', minimum: 0.0001 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  quantity: number;

  @ApiPropertyOptional({ description: '行备注', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

export class CreatePurchaseReturnFromRequestDto {
  @ApiProperty({ description: '来源退料申请单ID' })
  @IsString()
  returnRequestId: string;

  @ApiProperty({ description: '下推幂等键', maxLength: 100 })
  @IsString()
  @MaxLength(100)
  idempotencyKey: string;

  @ApiPropertyOptional({ description: '退料日期，ISO 8601' })
  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @ApiPropertyOptional({ description: '备注', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remark?: string;

  @ApiProperty({ type: [PurchaseReturnRequestLineDto], description: '退料明细' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseReturnRequestLineDto)
  lines: PurchaseReturnRequestLineDto[];
}

export class UpdatePurchaseReturnLineDto {
  @ApiProperty({ description: '采购退料明细ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: '退料数量', minimum: 0.0001 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  quantity: number;

  @ApiPropertyOptional({ description: '行备注', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

export class UpdatePurchaseReturnDto {
  @ApiPropertyOptional({ description: '退料原因', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({ description: '退料日期，ISO 8601' })
  @IsOptional()
  @IsDateString()
  returnDate?: string;

  @ApiPropertyOptional({ description: '备注', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remark?: string;

  @ApiPropertyOptional({ type: [UpdatePurchaseReturnLineDto], description: '完整有效明细列表' })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdatePurchaseReturnLineDto)
  lines?: UpdatePurchaseReturnLineDto[];
}

export class OperatePurchaseReturnDto {
  @ApiPropertyOptional({ description: '操作人标识' })
  @IsOptional()
  @IsString()
  operatedBy?: string;
}
