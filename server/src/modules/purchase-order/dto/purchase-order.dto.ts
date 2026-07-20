import { Type } from 'class-transformer';
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

export class PurchaseOrderEntryDto {
  @IsOptional() @IsString() id?: string;
  @IsNotEmpty() @IsString() materialId: string;
  @IsNotEmpty() @IsString() materialCode: string;
  @IsNotEmpty() @IsString() materialName: string;
  @IsOptional() @IsString() materialModel?: string;
  @IsNotEmpty() @IsString() unitId: string;
  @IsOptional() @IsString() unitCode?: string;
  @IsOptional() @IsString() unitName?: string;
  @IsNumber() @Min(0.0001) orderQty: number;
  @IsOptional() @IsNumber() @Min(0) unitPrice?: number;
  @IsOptional() @IsNumber() @Min(0) taxRate?: number;
  @IsOptional() @IsDateString() deliveryDate?: string;
  @IsOptional() @IsString() warehouseId?: string;
  @IsOptional() @IsBoolean() checkIncoming?: boolean;
  @IsOptional() @IsString() remark?: string;
}

export class CreatePurchaseOrderDto {
  @IsNotEmpty() @IsString() supplierId: string;
  @IsNotEmpty() @IsString() purchaseOrgId: string;
  @IsNotEmpty() @IsString() contractNo: string;
  @IsOptional() @IsDateString() orderDate?: string;
  @IsOptional() @IsDateString() deliveryDate?: string;
  @IsOptional() @IsString() warehouseId?: string;
  @IsOptional() @IsString() currencyId?: string;
  @IsOptional() @IsString() paymentTermId?: string;
  @IsOptional() @IsString() buyerId?: string;
  @IsOptional() @IsString() remark?: string;
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderEntryDto)
  entries: PurchaseOrderEntryDto[];
}

export class UpdatePurchaseOrderDto {
  @IsOptional() @IsString() supplierId?: string;
  @IsOptional() @IsString() purchaseOrgId?: string;
  @IsOptional() @IsString() contractNo?: string;
  @IsOptional() @IsDateString() orderDate?: string;
  @IsOptional() @IsDateString() deliveryDate?: string;
  @IsOptional() @IsString() warehouseId?: string;
  @IsOptional() @IsString() currencyId?: string;
  @IsOptional() @IsString() paymentTermId?: string;
  @IsOptional() @IsString() buyerId?: string;
  @IsOptional() @IsString() remark?: string;
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseOrderEntryDto)
  entries?: PurchaseOrderEntryDto[];
}

export class PushRequestLineDto {
  @IsNotEmpty() @IsString() requestEntryId: string;
  @IsNumber() @Min(0.0001) quantity: number;
  @IsOptional() @IsNumber() @Min(0) unitPrice?: number;
  @IsOptional() @IsNumber() @Min(0) taxRate?: number;
  @IsOptional() @IsDateString() deliveryDate?: string;
  @IsOptional() @IsString() warehouseId?: string;
  @IsOptional() @IsBoolean() checkIncoming?: boolean;
  @IsOptional() @IsString() remark?: string;
}

export class PushPurchaseRequestToOrderDto {
  @IsNotEmpty() @IsString() @MaxLength(100) idempotencyKey: string;
  @IsNotEmpty() @IsString() supplierId: string;
  @IsNotEmpty() @IsString() contractNo: string;
  @IsOptional() @IsDateString() orderDate?: string;
  @IsOptional() @IsString() currencyId?: string;
  @IsOptional() @IsString() paymentTermId?: string;
  @IsOptional() @IsString() buyerId?: string;
  @IsOptional() @IsString() remark?: string;
  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PushRequestLineDto)
  lines?: PushRequestLineDto[];

  // 旧接口兼容：未传 lines 时，按每张申请的全部剩余批准数量生成订单行。
  @IsOptional() @IsArray() @IsString({ each: true }) requestIds?: string[];
}
