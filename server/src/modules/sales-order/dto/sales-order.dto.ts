import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateSalesOrderDto {
  @ApiProperty({ description: '客户ID', required: true })
  @IsString()
  customerId: string;

  @ApiProperty({ description: '订单日期', required: true })
  @IsString()
  orderDate: string;

  @ApiProperty({ description: '交货日期', required: false })
  @IsOptional()
  @IsString()
  deliveryDate?: string;

  @ApiProperty({ description: '仓库ID', required: false })
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiProperty({ description: '总金额', required: false })
  @IsOptional()
  @IsNumber()
  totalAmount?: number;

  @ApiProperty({ description: '税额', required: false })
  @IsOptional()
  @IsNumber()
  totalTax?: number;

  @ApiProperty({ description: '价税合计', required: false })
  @IsOptional()
  @IsNumber()
  totalNetAmount?: number;

  @ApiProperty({ description: '币种ID', required: false })
  @IsOptional()
  @IsString()
  currencyId?: string;

  @ApiProperty({ description: '付款条件ID', required: false })
  @IsOptional()
  @IsString()
  paymentTermId?: string;

  @ApiProperty({ description: '销售员ID', required: false })
  @IsOptional()
  @IsString()
  salespersonId?: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateSalesOrderDto extends CreateSalesOrderDto {
  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;
}