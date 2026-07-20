import { IsDateString, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateIncomingInspectionDto {
  @IsNotEmpty()
  @IsString()
  receiveNoticeEntryId: string;
}

export class UpdateQualityInspectionDto {
  @IsOptional()
  @IsNumber()
  @Min(0.0001)
  inspectionQty?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sampleQty?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  qualifiedQty?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  unqualifiedQty?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  concessionQty?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  inspector?: string;

  @IsOptional()
  @IsDateString()
  inspectionDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  batchNo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  remark?: string;
}

export class ApproveQualityInspectionDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  approvedBy?: string;
}
