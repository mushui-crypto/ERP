import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class ReceivableDto {
  @ApiProperty({ description: '客户ID', required: false })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ description: '来源类型, 如sales_order', required: false })
  @IsOptional()
  @IsString()
  sourceType?: string;

  @ApiProperty({ description: '来源单据ID', required: false })
  @IsOptional()
  @IsString()
  sourceId?: string;

  @ApiProperty({ description: '应收金额', required: false })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ description: '应收日期', required: false })
  @IsOptional()
  @IsString()
  receivableDate?: string;

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

export class CreateReceivableDto extends ReceivableDto {
  @ApiProperty({ description: '客户ID', required: true })
  @IsString()
  customerId: string;

  @ApiProperty({ description: '来源类型', required: true })
  @IsString()
  sourceType: string;

  @ApiProperty({ description: '应收金额', required: true })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: '应收日期', required: true })
  @IsString()
  receivableDate: string;

  @ApiProperty({ description: '到期日期', required: true })
  @IsString()
  dueDate: string;
}

export class UpdateReceivableDto extends ReceivableDto {}

export class ReceivePaymentDto {
  @ApiProperty({ description: '收款金额', required: true })
  @IsNumber()
  receiveAmount: number;

  @ApiProperty({ description: '收款日期', required: true })
  @IsString()
  receiveDate: string;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}