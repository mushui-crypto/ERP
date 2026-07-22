import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class PurchaseReportQueryDto {
  @ApiPropertyOptional({ description: '采购组织ID' })
  @IsOptional() @IsString() purchaseOrgId?: string;
  @ApiPropertyOptional({ description: '供应商ID' })
  @IsOptional() @IsString() supplierId?: string;
  @ApiPropertyOptional({ description: '采购员ID' })
  @IsOptional() @IsString() buyerId?: string;
  @ApiPropertyOptional({ enum: ['STANDARD', 'ASSET_NO_INBOUND', 'ASSET_INBOUND', 'EXPENSE_PURCHASE'] })
  @IsOptional() @IsIn(['STANDARD', 'ASSET_NO_INBOUND', 'ASSET_INBOUND', 'EXPENSE_PURCHASE']) businessType?: string;
  @ApiPropertyOptional({ description: '采购订单号，模糊匹配' })
  @IsOptional() @IsString() orderNo?: string;
  @ApiPropertyOptional({ description: '物料ID' })
  @IsOptional() @IsString() materialId?: string;
  @ApiPropertyOptional({ description: '费用项目名称，模糊匹配' })
  @IsOptional() @IsString() expenseItemName?: string;
  @ApiPropertyOptional({ description: '开始日期，ISO 8601' })
  @IsOptional() @IsDateString() dateFrom?: string;
  @ApiPropertyOptional({ description: '结束日期，ISO 8601' })
  @IsOptional() @IsDateString() dateTo?: string;
  @ApiPropertyOptional({ description: '采购订单状态', type: Number })
  @IsOptional() @Type(() => Number) @IsInt() orderStatus?: number;
  @ApiPropertyOptional({ default: 1, minimum: 1, type: Number })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) page = 1;
  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 200, type: Number })
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(200) pageSize = 20;
}
