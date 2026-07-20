import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class PushOrderReceiveLineDto {
  @IsNotEmpty()
  @IsString()
  orderEntryId: string;

  @IsNumber()
  @Min(0.0001)
  quantity: number;

  @IsOptional()
  @IsBoolean()
  checkIncoming?: boolean;

  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsOptional()
  @IsString()
  supplierLot?: string;

  @IsOptional()
  @IsDateString()
  produceDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

export class PushPurchaseOrderToReceiveNoticeDto {
  @IsNotEmpty()
  @IsString()
  purchaseOrderId: string;

  @IsNotEmpty()
  @IsString()
  stockOrgId: string;

  @IsNotEmpty()
  @IsString()
  purchaseOrgId: string;

  @IsNotEmpty()
  @IsString()
  receiveBatchNo: string;

  @IsOptional()
  @IsDateString()
  receiveDate?: string;

  @IsOptional()
  @IsString()
  sendBillNo?: string;

  @IsOptional()
  @IsString()
  ladBillNo?: string;

  @IsOptional()
  @IsBoolean()
  needCheck?: boolean;

  @IsOptional()
  @IsString()
  receiverId?: string;

  @IsOptional()
  @IsString()
  receiveDepartmentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PushOrderReceiveLineDto)
  lines: PushOrderReceiveLineDto[];
}

export class UpdateReceiveNoticeLineDto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNumber()
  @Min(0.0001)
  quantity: number;

  @IsOptional()
  @IsBoolean()
  checkIncoming?: boolean;

  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsOptional()
  @IsString()
  supplierLot?: string;

  @IsOptional()
  @IsDateString()
  produceDate?: string;

  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

export class UpdatePurchaseReceiveNoticeDto {
  @IsOptional() @IsString() stockOrgId?: string;
  @IsOptional() @IsString() purchaseOrgId?: string;
  @IsOptional() @IsDateString() receiveDate?: string;
  @IsOptional() @IsString() sendBillNo?: string;
  @IsOptional() @IsString() ladBillNo?: string;
  @IsOptional() @IsBoolean() needCheck?: boolean;
  @IsOptional() @IsString() receiverId?: string;
  @IsOptional() @IsString() receiveDepartmentId?: string;
  @IsOptional() @IsString() @MaxLength(500) remark?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => UpdateReceiveNoticeLineDto)
  lines?: UpdateReceiveNoticeLineDto[];
}

export class ReversePurchaseReceiveNoticeDto {
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  idempotencyKey: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  reason: string;

  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsOptional()
  @IsString()
  @MaxLength(50)
  operatedBy?: string;
}
