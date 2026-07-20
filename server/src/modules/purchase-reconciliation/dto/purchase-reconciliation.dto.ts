import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class GeneratePurchaseReconciliationDto {
  @ApiProperty({ description: '生成幂等键', maxLength: 100 })
  @IsNotEmpty() @IsString() @MaxLength(100) idempotencyKey: string;
  @ApiProperty({ description: '供应商ID' })
  @IsNotEmpty() @IsString() supplierId: string;
  @ApiProperty({ description: '采购组织ID' })
  @IsNotEmpty() @IsString() purchaseOrgId: string;
  @ApiProperty({ description: '结算组织ID' })
  @IsNotEmpty() @IsString() settleOrgId: string;
  @ApiProperty({ description: '币种ID' })
  @IsNotEmpty() @IsString() currencyId: string;
  @ApiProperty({ description: '对账期间开始日期，ISO 8601' })
  @IsDateString() periodStart: string;
  @ApiProperty({ description: '对账期间结束日期，ISO 8601' })
  @IsDateString() periodEnd: string;
  @ApiPropertyOptional({ description: '可选采购订单ID' })
  @IsOptional() @IsString() purchaseOrderId?: string;
  @ApiPropertyOptional({ description: '对账日期，ISO 8601' })
  @IsOptional() @IsDateString() reconciliationDate?: string;
  @ApiPropertyOptional({ description: '备注', maxLength: 1000 })
  @IsOptional() @IsString() @MaxLength(1000) remark?: string;
}

export class ConfirmPurchaseReconciliationLineDto {
  @ApiProperty({ description: '对账明细ID' })
  @IsNotEmpty() @IsString() entryId: string;
  @ApiProperty({ description: '供应商确认数量' })
  @IsNumber() confirmedQty: number;
  @ApiProperty({ description: '供应商确认单价' })
  @IsNumber() confirmedUnitPrice: number;
  @ApiProperty({ description: '供应商确认未税金额' })
  @IsNumber() confirmedUntaxedAmount: number;
  @ApiProperty({ description: '供应商确认税额' })
  @IsNumber() confirmedTaxAmount: number;
  @ApiProperty({ description: '供应商确认价税合计' })
  @IsNumber() confirmedTotalAmount: number;
  @ApiPropertyOptional({ description: '非零差异原因', maxLength: 500 })
  @IsOptional() @IsString() @MaxLength(500) differenceReason?: string;
  @ApiPropertyOptional({ description: '确认备注', maxLength: 500 })
  @IsOptional() @IsString() @MaxLength(500) remark?: string;
}

export class ConfirmPurchaseReconciliationDto {
  @ApiPropertyOptional({ description: '确认人标识', maxLength: 50 })
  @IsOptional() @IsString() @MaxLength(50) confirmedBy?: string;
  @ApiProperty({ type: [ConfirmPurchaseReconciliationLineDto], description: '完整且不重复的全部对账明细确认值' })
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => ConfirmPurchaseReconciliationLineDto)
  entries: ConfirmPurchaseReconciliationLineDto[];
}

export class CancelPurchaseReconciliationDto {
  @ApiPropertyOptional({ description: '取消人标识', maxLength: 50 })
  @IsOptional() @IsString() @MaxLength(50) canceledBy?: string;
  @ApiProperty({ description: '取消原因', maxLength: 500 })
  @IsNotEmpty() @IsString() @MaxLength(500) reason: string;
}
