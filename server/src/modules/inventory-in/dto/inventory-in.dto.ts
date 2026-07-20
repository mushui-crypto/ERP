import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

/** 兼容既有非采购单行入库接口；采购入库禁止使用此 DTO 创建。 */
export class CreateInventoryInDto {
  @IsNotEmpty({ message: '组织ID不能为空' }) @IsString() orgId: string;
  @IsNotEmpty({ message: '仓库ID不能为空' }) @IsString() warehouseId: string;
  @IsNotEmpty({ message: '仓库编码不能为空' }) @IsString() @MaxLength(50) warehouseCode: string;
  @IsNotEmpty({ message: '仓库名称不能为空' }) @IsString() @MaxLength(200) warehouseName: string;
  @IsNotEmpty({ message: '入库类型不能为空' }) @IsNumber() inType: number;
  @IsOptional() @IsString() sourceId?: string;
  @IsOptional() @IsString() @MaxLength(50) sourceNo?: string;
  @IsOptional() @IsString() supplierId?: string;
  @IsOptional() @IsString() @MaxLength(50) supplierCode?: string;
  @IsOptional() @IsString() @MaxLength(200) supplierName?: string;
  @IsNotEmpty({ message: '物料ID不能为空' }) @IsString() materialId: string;
  @IsNotEmpty({ message: '物料编码不能为空' }) @IsString() @MaxLength(50) materialCode: string;
  @IsNotEmpty({ message: '物料名称不能为空' }) @IsString() @MaxLength(200) materialName: string;
  @IsOptional() @IsString() @MaxLength(200) spec?: string;
  @IsNotEmpty({ message: '计量单位ID不能为空' }) @IsString() unitId: string;
  @IsNotEmpty({ message: '计量单位编码不能为空' }) @IsString() @MaxLength(50) unitCode: string;
  @IsNotEmpty({ message: '计量单位名称不能为空' }) @IsString() @MaxLength(50) unitName: string;
  @IsNotEmpty({ message: '入库数量不能为空' }) @IsNumber() quantity: number;
  @IsOptional() @IsNumber() unitPrice?: number;
  @IsOptional() @IsNumber() amount?: number;
  @IsOptional() @IsString() @MaxLength(50) lotNo?: string;
  @IsOptional() @IsDate() expireDate?: Date;
  @IsOptional() @IsString() @MaxLength(100) location?: string;
  @IsOptional() @IsDate() inDate?: Date;
  @IsOptional() @IsString() remark?: string;
}

/** 兼容既有非采购单行入库修改接口。 */
export class UpdateInventoryInDto {
  @IsOptional() @IsNumber() quantity?: number;
  @IsOptional() @IsNumber() unitPrice?: number;
  @IsOptional() @IsNumber() amount?: number;
  @IsOptional() @IsString() @MaxLength(50) lotNo?: string;
  @IsOptional() @IsDate() expireDate?: Date;
  @IsOptional() @IsString() @MaxLength(100) location?: string;
  @IsOptional() @IsDate() inDate?: Date;
  @IsOptional() @IsString() remark?: string;
}

export class PushReceiveNoticeEntryToInventoryInDto {
  @IsNotEmpty({ message: '来源收料通知明细ID不能为空' }) @IsString()
  sourceReceiveNoticeEntryId: string;

  @IsNumber({}, { message: '入库数量必须为数字' }) @Min(0.0001, { message: '入库数量必须大于0' })
  quantity: number;

  @IsNotEmpty({ message: '仓库ID不能为空' }) @IsString()
  warehouseId: string;

  @IsOptional() @IsString() @MaxLength(100) lotNo?: string;
  @IsOptional() @IsDateString() produceDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsString() @MaxLength(100) location?: string;
  @IsOptional() @IsString() @MaxLength(500) remark?: string;
}

export class PushReceiveNoticesToInventoryInDto {
  @IsNotEmpty({ message: '幂等键不能为空' }) @IsString() @MaxLength(100)
  idempotencyKey: string;

  @IsOptional() @IsDateString()
  inDate?: string;

  @IsNotEmpty({ message: '结算组织不能为空' }) @IsString()
  settleOrgId: string;

  @IsNotEmpty({ message: '货主类型不能为空' }) @IsString() @MaxLength(50)
  ownerType: string;

  @IsNotEmpty({ message: '货主不能为空' }) @IsString()
  ownerId: string;

  @IsOptional() @IsString() @MaxLength(50)
  businessType?: string;

  @IsOptional() @IsString() @MaxLength(500)
  remark?: string;

  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => PushReceiveNoticeEntryToInventoryInDto)
  entries: PushReceiveNoticeEntryToInventoryInDto[];
}

export class UpdatePurchaseInventoryInEntryDto {
  @IsNotEmpty() @IsString() id: string;
  @IsNumber() @Min(0.0001) quantity: number;
  @IsNotEmpty() @IsString() warehouseId: string;
  @IsOptional() @IsString() @MaxLength(100) lotNo?: string;
  @IsOptional() @IsDateString() produceDate?: string;
  @IsOptional() @IsDateString() expiryDate?: string;
  @IsOptional() @IsString() @MaxLength(100) location?: string;
  @IsOptional() @IsString() @MaxLength(500) remark?: string;
}

export class UpdatePurchaseInventoryInDto {
  @IsOptional() @IsDateString() inDate?: string;
  @IsOptional() @IsString() settleOrgId?: string;
  @IsOptional() @IsString() @MaxLength(50) ownerType?: string;
  @IsOptional() @IsString() ownerId?: string;
  @IsOptional() @IsString() @MaxLength(500) remark?: string;

  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => UpdatePurchaseInventoryInEntryDto)
  entries: UpdatePurchaseInventoryInEntryDto[];
}

export class ApproveInventoryInDto {
  @IsOptional() @IsString() @MaxLength(50)
  approvedBy?: string;
}

export class GenerateEstimatedPayableDto {
  @IsOptional() @IsString() @MaxLength(50)
  operatedBy?: string;
}
