import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, MinLength, MaxLength } from 'class-validator';

export class CustomerDto {
  @ApiProperty({ description: '客户编码', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  customerCode?: string;

  @ApiProperty({ description: '客户名称', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  customerName?: string;

  @ApiProperty({ description: '简称', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  shortName?: string;

  @ApiProperty({ description: '客户类型: 1-企业 2-个人', required: false })
  @IsOptional()
  @IsNumber()
  customerType?: number;

  @ApiProperty({ description: '所属行业', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  industry?: string;

  @ApiProperty({ description: '联系人', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  contactPerson?: string;

  @ApiProperty({ description: '联系电话', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  contactPhone?: string;

  @ApiProperty({ description: '邮箱', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  email?: string;

  @ApiProperty({ description: '地址', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  address?: string;

  @ApiProperty({ description: '信用额度', required: false })
  @IsOptional()
  @IsNumber()
  creditLimit?: number;

  @ApiProperty({ description: '信用期(天)', required: false })
  @IsOptional()
  @IsNumber()
  creditPeriod?: number;

  @ApiProperty({ description: '付款条件ID', required: false })
  @IsOptional()
  @IsString()
  paymentTermId?: string;

  @ApiProperty({ description: '销售员ID', required: false })
  @IsOptional()
  @IsString()
  salespersonId?: string;

  @ApiProperty({ description: '税号', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxNumber?: string;

  @ApiProperty({ description: '开户银行', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  bankName?: string;

  @ApiProperty({ description: '银行账号', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  bankAccount?: string;

  @ApiProperty({ description: '状态: 1-启用 0-禁用', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class CreateCustomerDto extends CustomerDto {
  @ApiProperty({ description: '客户编码', required: true })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  customerCode: string;

  @ApiProperty({ description: '客户名称', required: true })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  customerName: string;
}

export class UpdateCustomerDto extends CustomerDto {}