import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAssetOutRequestDto {
  @IsNotEmpty() @IsString() @MaxLength(100) idempotencyKey: string;
  @IsNotEmpty() @IsString() assetAcceptanceId: string;
  @IsNotEmpty() @IsString() warehouseId: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() applicantId?: string;
  @IsOptional() @IsDateString() requestDate?: string;
  @IsOptional() @IsString() @MaxLength(1000) remark?: string;
}

export class UpdateAssetOutRequestDto {
  @IsOptional() @IsString() warehouseId?: string;
  @IsOptional() @IsString() departmentId?: string;
  @IsOptional() @IsString() applicantId?: string;
  @IsOptional() @IsDateString() requestDate?: string;
  @IsOptional() @IsString() @MaxLength(1000) remark?: string;
}

export class ApproveAssetOutRequestDto {
  @IsOptional() @IsString() @MaxLength(50) approvedBy?: string;
}

export class PushAssetOutRequestDto {
  @IsNotEmpty() @IsString() @MaxLength(100) idempotencyKey: string;
  @IsOptional() @IsDateString() outDate?: string;
  @IsOptional() @IsString() @MaxLength(1000) remark?: string;
}
