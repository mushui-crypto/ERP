import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, MinLength, MaxLength } from 'class-validator';

export class SupplierDto {
  @ApiProperty({ description: '供应商编码', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  supplierCode?: string;

  @ApiProperty({ description: '供应商名称', required: false })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  supplierName?: string;

  @ApiProperty({ description: '简称', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  shortName?: string;

  @ApiProperty({ description: '供应商类型: 1-企业 2-个人', required: false })
  @IsOptional()
  @IsNumber()
  supplierType?: number;

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

  @ApiProperty({ description: '付款条件ID', required: false })
  @IsOptional()
  @IsString()
  paymentTermId?: string;

  @ApiProperty({ description: '采购员ID', required: false })
  @IsOptional()
  @IsString()
  buyerId?: string;

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

export class CreateSupplierDto extends SupplierDto {
  @ApiProperty({ description: '供应商编码', required: true })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  supplierCode: string;

  @ApiProperty({ description: '供应商名称', required: true })
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  supplierName: string;
}

export class UpdateSupplierDto extends SupplierDto {}