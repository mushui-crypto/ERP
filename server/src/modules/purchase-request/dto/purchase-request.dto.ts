import { Type } from 'class-transformer';
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

export class PurchaseRequestEntryDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsNotEmpty()
  @IsString()
  purchaseOrgId: string;

  @IsNotEmpty()
  @IsString()
  materialId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  materialCode: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  materialName: string;

  @IsOptional()
  @IsString()
  materialModel?: string;

  @IsNotEmpty()
  @IsString()
  unitId: string;

  @IsOptional()
  @IsString()
  unitCode?: string;

  @IsOptional()
  @IsString()
  unitName?: string;

  @IsNumber()
  @Min(0.0001)
  requestQty: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedAmount?: number;

  @IsOptional()
  @IsDateString()
  requiredDate?: string;

  @IsOptional()
  @IsString()
  supplierId?: string;

  @IsOptional()
  @IsString()
  supplierCode?: string;

  @IsOptional()
  @IsString()
  supplierName?: string;

  @IsOptional()
  @IsString()
  warehouseId?: string;

  @IsOptional()
  @IsString()
  contractNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

export class CreatePurchaseRequestDto {
  @IsNotEmpty()
  @IsString()
  orgId: string;

  @IsOptional()
  @IsString()
  departmentId?: string;

  @IsOptional()
  @IsString()
  applicantId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  applicantName?: string;

  @IsOptional()
  @IsString()
  requestType?: string;

  @IsOptional()
  @IsDateString()
  requestDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PurchaseRequestEntryDto)
  entries?: PurchaseRequestEntryDto[];

  // 旧单行创建契约兼容字段；服务层转换为一条 entries。
  @IsOptional() @IsString() purchaseOrgId?: string;
  @IsOptional() @IsString() materialId?: string;
  @IsOptional() @IsString() materialCode?: string;
  @IsOptional() @IsString() materialName?: string;
  @IsOptional() @IsString() unitId?: string;
  @IsOptional() @IsString() unitCode?: string;
  @IsOptional() @IsString() unitName?: string;
  @IsOptional() @IsNumber() @Min(0.0001) quantity?: number;
  @IsOptional() @IsNumber() @Min(0) estimatedPrice?: number;
  @IsOptional() @IsNumber() @Min(0) estimatedAmount?: number;
  @IsOptional() @IsDateString() requiredDate?: string;
  @IsOptional() @IsString() supplierId?: string;
  @IsOptional() @IsString() supplierCode?: string;
  @IsOptional() @IsString() supplierName?: string;
  @IsOptional() @IsString() warehouseId?: string;
}

export class UpdatePurchaseRequestDto extends CreatePurchaseRequestDto {}

export class ApprovePurchaseRequestEntryDto {
  @IsNotEmpty()
  @IsString()
  entryId: string;

  @IsNumber()
  @Min(0)
  approveQty: number;
}

export class ApprovePurchaseRequestDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ApprovePurchaseRequestEntryDto)
  entries?: ApprovePurchaseRequestEntryDto[];
}
