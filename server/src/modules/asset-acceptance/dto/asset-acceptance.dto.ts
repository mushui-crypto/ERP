import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min, ValidateNested } from 'class-validator';

export class AssetAcceptanceLineDto {
  @IsNotEmpty() @IsString() sourceEntryId: string;
  @IsNumber() @Min(1) acceptanceQty: number;
  @IsInt() @Min(0) passedQty: number;
  @IsNumber() @Min(0) failedQty: number;
  @IsNotEmpty() @IsString() @MaxLength(50) assetCategoryCode: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() custodianId?: string;
  @IsOptional() @IsString() @MaxLength(200) location?: string;
  @IsOptional() @IsString() @MaxLength(500) remark?: string;
}

export class CreateAssetAcceptanceDto {
  @IsNotEmpty() @IsString() @MaxLength(100) idempotencyKey: string;
  @IsNotEmpty() @IsString() sourceId: string;
  @IsOptional() @IsDateString() acceptanceDate?: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() acceptorId?: string;
  @IsOptional() @IsString() settleOrgId?: string;
  @IsOptional() @IsString() @MaxLength(1000) remark?: string;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => AssetAcceptanceLineDto)
  entries: AssetAcceptanceLineDto[];
}

export class UpdateAssetAcceptanceDto {
  @IsOptional() @IsDateString() acceptanceDate?: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() acceptorId?: string;
  @IsOptional() @IsString() @MaxLength(1000) remark?: string;
  @IsOptional() @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => AssetAcceptanceLineDto)
  entries?: AssetAcceptanceLineDto[];
}

export class ApproveAssetAcceptanceDto {
  @IsOptional() @IsString() @MaxLength(50) approvedBy?: string;
}
