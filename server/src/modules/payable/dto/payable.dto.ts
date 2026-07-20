import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class PayableDto {
  @ApiProperty({ description: '供应商ID', required: false })
  @IsOptional()
  @IsString()
  supplierId?: string;

  @ApiProperty({ description: '来源类型, 如purchase_order', required: false })
  @IsOptional()
  @IsString()
  sourceType?: string;

  @ApiProperty({ description: '来源单据ID', required: false })
  @IsOptional()
  @IsString()
  sourceId?: string;

  @ApiProperty({ description: '应付金额', required: false })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ description: '应付日期', required: false })
  @IsOptional()
  @IsString()
  payableDate?: string;

  @ApiProperty({ description: '到期日期', required: false })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiProperty({ description: '会计期间', required: false })
  @IsOptional()
  @IsString()
  period?: string;

  @ApiProperty({ description: '状态: 0-未结算 1-部分结算 2-已结算 3-逾期', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreatePayableDto extends PayableDto {
  @ApiProperty({ description: '供应商ID', required: true })
  @IsString()
  supplierId: string;

  @ApiProperty({ description: '来源类型', required: true })
  @IsString()
  sourceType: string;

  @ApiProperty({ description: '应付金额', required: true })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: '应付日期', required: true })
  @IsString()
  payableDate: string;

  @ApiProperty({ description: '到期日期', required: true })
  @IsString()
  dueDate: string;
}

export class UpdatePayableDto extends PayableDto {}

export class MakePaymentDto {
  @ApiProperty({ description: '付款金额', required: true })
  @IsNumber()
  payAmount: number;

  @ApiProperty({ description: '付款日期', required: true })
  @IsString()
  payDate: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}