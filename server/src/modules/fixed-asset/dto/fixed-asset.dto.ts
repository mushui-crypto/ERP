import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class CreateAssetCategoryDto {
  @IsNotEmpty() @IsString() @MaxLength(50) categoryCode: string;
  @IsNotEmpty() @IsString() @MaxLength(200) categoryName: string;
  @IsNotEmpty() @IsString() @MaxLength(50) assetType: string;
  @IsInt() @Min(1) usefulLifeMonths: number;
  @IsNumber() @Min(0) @Max(100) salvageRate: number;
  @IsOptional() @IsString() @IsIn(['straight_line', 'declining_balance', 'sum_years']) depreciationMethod?: string;
  @IsOptional() @IsString() @MaxLength(500) remark?: string;
}
