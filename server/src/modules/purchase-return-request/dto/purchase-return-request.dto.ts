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

export class PurchaseReturnRequestLineDto {
  @ApiProperty({ description: '来源采购入库明细ID' })
  @IsString()
  inventoryInEntryId: string;

  @ApiProperty({ description: '申请退料数量', minimum: 0.0001 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  quantity: number;

  @ApiPropertyOptional({ description: '行备注', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

export class CreatePurchaseReturnRequestFromInboundDto {
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

  @ApiPropertyOptional({ description: '申请日期，ISO 8601' })
  @IsOptional()
  @IsDateString()
  requestDate?: string;

  @ApiPropertyOptional({ description: '备注', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remark?: string;

  @ApiProperty({ type: [PurchaseReturnRequestLineDto], description: '申请明细' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseReturnRequestLineDto)
  lines: PurchaseReturnRequestLineDto[];
}

export class UpdatePurchaseReturnRequestLineDto {
  @ApiProperty({ description: '退料申请明细ID' })
  @IsString()
  id: string;

  @ApiProperty({ description: '申请退料数量', minimum: 0.0001 })
  @IsNumber({ maxDecimalPlaces: 4 })
  @Min(0.0001)
  quantity: number;

  @ApiPropertyOptional({ description: '行备注', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

export class UpdatePurchaseReturnRequestDto {
  @ApiPropertyOptional({ enum: PurchaseReturnMode, description: '退料方式' })
  @IsOptional()
  @IsEnum(PurchaseReturnMode)
  returnMode?: PurchaseReturnMode;

  @ApiPropertyOptional({ description: '退料原因', maxLength: 500 })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @ApiPropertyOptional({ description: '申请日期，ISO 8601' })
  @IsOptional()
  @IsDateString()
  requestDate?: string;

  @ApiPropertyOptional({ description: '备注', maxLength: 1000 })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  remark?: string;

  @ApiPropertyOptional({ type: [UpdatePurchaseReturnRequestLineDto], description: '完整有效明细列表' })
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdatePurchaseReturnRequestLineDto)
  lines?: UpdatePurchaseReturnRequestLineDto[];
}

export class OperatePurchaseReturnRequestDto {
  @ApiPropertyOptional({ description: '操作人标识' })
  @IsOptional()
  @IsString()
  operatedBy?: string;
}
