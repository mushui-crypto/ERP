import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsDate, MaxLength } from 'class-validator';

export class CreateSalesQuoteDto {
  @IsNotEmpty({ message: '组织ID不能为空' })
  @IsString({ message: '组织ID必须为字符串' })
  orgId: string;

  @IsNotEmpty({ message: '客户ID不能为空' })
  @IsString({ message: '客户ID必须为字符串' })
  customerId: string;

  @IsNotEmpty({ message: '客户编码不能为空' })
  @IsString({ message: '客户编码必须为字符串' })
  @MaxLength(50, { message: '客户编码长度不能超过50' })
  customerCode: string;

  @IsNotEmpty({ message: '客户名称不能为空' })
  @IsString({ message: '客户名称必须为字符串' })
  @MaxLength(200, { message: '客户名称长度不能超过200' })
  customerName: string;

  @IsNotEmpty({ message: '物料ID不能为空' })
  @IsString({ message: '物料ID必须为字符串' })
  materialId: string;

  @IsNotEmpty({ message: '物料编码不能为空' })
  @IsString({ message: '物料编码必须为字符串' })
  @MaxLength(50, { message: '物料编码长度不能超过50' })
  materialCode: string;

  @IsNotEmpty({ message: '物料名称不能为空' })
  @IsString({ message: '物料名称必须为字符串' })
  @MaxLength(200, { message: '物料名称长度不能超过200' })
  materialName: string;

  @IsNotEmpty({ message: '计量单位ID不能为空' })
  @IsString({ message: '计量单位ID必须为字符串' })
  unitId: string;

  @IsNotEmpty({ message: '计量单位编码不能为空' })
  @IsString({ message: '计量单位编码必须为字符串' })
  @MaxLength(50, { message: '计量单位编码长度不能超过50' })
  unitCode: string;

  @IsNotEmpty({ message: '计量单位名称不能为空' })
  @IsString({ message: '计量单位名称必须为字符串' })
  @MaxLength(50, { message: '计量单位名称长度不能超过50' })
  unitName: string;

  @IsNotEmpty({ message: '报价数量不能为空' })
  @IsNumber({}, { message: '报价数量必须为数字' })
  quantity: number;

  @IsNotEmpty({ message: '单价不能为空' })
  @IsNumber({}, { message: '单价必须为数字' })
  unitPrice: number;

  @IsOptional()
  @IsNumber({}, { message: '金额必须为数字' })
  amount?: number;

  @IsOptional()
  @IsNumber({}, { message: '税率必须为数字' })
  taxRate?: number;

  @IsOptional()
  @IsNumber({}, { message: '税额必须为数字' })
  taxAmount?: number;

  @IsOptional()
  @IsNumber({}, { message: '含税金额必须为数字' })
  totalAmount?: number;

  @IsOptional()
  @IsDate({ message: '报价日期必须为日期格式' })
  quoteDate?: Date;

  @IsNotEmpty({ message: '有效期至不能为空' })
  @IsDate({ message: '有效期至必须为日期格式' })
  validDate: Date;

  @IsOptional()
  @IsString({ message: '交货周期必须为字符串' })
  @MaxLength(50, { message: '交货周期长度不能超过50' })
  deliveryPeriod?: string;

  @IsOptional()
  @IsString({ message: '付款条件ID必须为字符串' })
  paymentTermId?: string;

  @IsOptional()
  @IsString({ message: '付款条件名称必须为字符串' })
  @MaxLength(100, { message: '付款条件名称长度不能超过100' })
  paymentTermName?: string;

  @IsOptional()
  @IsString({ message: '备注必须为字符串' })
  remark?: string;
}

export class UpdateSalesQuoteDto {
  @IsOptional()
  @IsNumber({}, { message: '报价数量必须为数字' })
  quantity?: number;

  @IsOptional()
  @IsNumber({}, { message: '单价必须为数字' })
  unitPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: '税率必须为数字' })
  taxRate?: number;

  @IsOptional()
  @IsDate({ message: '有效期至必须为日期格式' })
  validDate?: Date;

  @IsOptional()
  @IsString({ message: '交货周期必须为字符串' })
  @MaxLength(50, { message: '交货周期长度不能超过50' })
  deliveryPeriod?: string;

  @IsOptional()
  @IsString({ message: '付款条件ID必须为字符串' })
  paymentTermId?: string;

  @IsOptional()
  @IsString({ message: '付款条件名称必须为字符串' })
  @MaxLength(100, { message: '付款条件名称长度不能超过100' })
  paymentTermName?: string;

  @IsOptional()
  @IsString({ message: '备注必须为字符串' })
  remark?: string;
}