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
  Min,
  ValidateNested,
} from 'class-validator';

export class PurchaseOrderChangeLineDto {
  @ApiProperty({ description: '来源采购订单明细ID' })
  @IsNotEmpty() @IsString()
  orderEntryId: string;

  @ApiPropertyOptional({ description: '变更后订单数量', minimum: 0.0001 })
  @IsOptional() @IsNumber() @Min(0.0001)
  newOrderQty?: number;

  @ApiPropertyOptional({ description: '变更后未税单价', minimum: 0 })
  @IsOptional() @IsNumber() @Min(0)
  newUnitPrice?: number;

  @ApiPropertyOptional({ description: '变更后交货日期，ISO 8601' })
  @IsOptional() @IsDateString()
  newDeliveryDate?: string;

  @ApiPropertyOptional({ description: '变更后仓库ID' })
  @IsOptional() @IsString()
  newWarehouseId?: string;

  @ApiPropertyOptional({ description: '变更后行备注', maxLength: 500 })
  @IsOptional() @IsString() @MaxLength(500)
  newRemark?: string;
}

export class CreatePurchaseOrderChangeDto {
  @ApiProperty({ description: '创建幂等键', maxLength: 100 })
  @IsNotEmpty() @IsString() @MaxLength(100)
  idempotencyKey: string;

  @ApiProperty({ description: '来源采购订单ID' })
  @IsNotEmpty() @IsString()
  orderId: string;

  @ApiPropertyOptional({ description: '变更日期，ISO 8601' })
  @IsOptional() @IsDateString()
  changeDate?: string;

  @ApiProperty({ description: '变更原因', maxLength: 500 })
  @IsNotEmpty() @IsString() @MaxLength(500)
  changeReason: string;

  @ApiPropertyOptional({ description: '表头备注', maxLength: 1000 })
  @IsOptional() @IsString() @MaxLength(1000)
  remark?: string;

  @ApiProperty({ type: [PurchaseOrderChangeLineDto], description: '至少一行实际发生变化的订单明细' })
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => PurchaseOrderChangeLineDto)
  entries: PurchaseOrderChangeLineDto[];
}

export class UpdatePurchaseOrderChangeDto {
  @ApiPropertyOptional({ description: '变更日期，ISO 8601' })
  @IsOptional() @IsDateString()
  changeDate?: string;

  @ApiPropertyOptional({ description: '变更原因', maxLength: 500 })
  @IsOptional() @IsString() @MaxLength(500)
  changeReason?: string;

  @ApiPropertyOptional({ description: '表头备注', maxLength: 1000 })
  @IsOptional() @IsString() @MaxLength(1000)
  remark?: string;

  @ApiPropertyOptional({ type: [PurchaseOrderChangeLineDto], description: '完整变更明细列表' })
  @IsOptional() @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => PurchaseOrderChangeLineDto)
  entries?: PurchaseOrderChangeLineDto[];
}

export class OperatePurchaseOrderChangeDto {
  @ApiPropertyOptional({ description: '操作人标识', maxLength: 50 })
  @IsOptional() @IsString() @MaxLength(50)
  operatedBy?: string;

  @ApiPropertyOptional({ description: '驳回或取消原因；驳回时必填', maxLength: 500 })
  @IsOptional() @IsString() @MaxLength(500)
  reason?: string;
}
