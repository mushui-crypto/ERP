import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsDate, MaxLength } from 'class-validator';

export class CreateInventoryOutDto {
  @IsNotEmpty({ message: '组织ID不能为空' })
  @IsString({ message: '组织ID必须为字符串' })
  orgId: string;

  @IsNotEmpty({ message: '仓库ID不能为空' })
  @IsString({ message: '仓库ID必须为字符串' })
  warehouseId: string;

  @IsNotEmpty({ message: '仓库编码不能为空' })
  @IsString({ message: '仓库编码必须为字符串' })
  @MaxLength(50, { message: '仓库编码长度不能超过50' })
  warehouseCode: string;

  @IsNotEmpty({ message: '仓库名称不能为空' })
  @IsString({ message: '仓库名称必须为字符串' })
  @MaxLength(200, { message: '仓库名称长度不能超过200' })
  warehouseName: string;

  @IsNotEmpty({ message: '出库类型不能为空' })
  @IsNumber({}, { message: '出库类型必须为数字' })
  outType: number;

  @IsOptional()
  @IsString({ message: '来源单据ID必须为字符串' })
  sourceId?: string;

  @IsOptional()
  @IsString({ message: '来源单据号必须为字符串' })
  @MaxLength(50, { message: '来源单据号长度不能超过50' })
  sourceNo?: string;

  @IsOptional()
  @IsString({ message: '客户ID必须为字符串' })
  customerId?: string;

  @IsOptional()
  @IsString({ message: '客户编码必须为字符串' })
  @MaxLength(50, { message: '客户编码长度不能超过50' })
  customerCode?: string;

  @IsOptional()
  @IsString({ message: '客户名称必须为字符串' })
  @MaxLength(200, { message: '客户名称长度不能超过200' })
  customerName?: string;

  @IsOptional()
  @IsString({ message: '领用部门ID必须为字符串' })
  departmentId?: string;

  @IsOptional()
  @IsString({ message: '领用部门编码必须为字符串' })
  @MaxLength(50, { message: '领用部门编码长度不能超过50' })
  departmentCode?: string;

  @IsOptional()
  @IsString({ message: '领用部门名称必须为字符串' })
  @MaxLength(200, { message: '领用部门名称长度不能超过200' })
  departmentName?: string;

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

  @IsOptional()
  @IsString({ message: '规格型号必须为字符串' })
  @MaxLength(200, { message: '规格型号长度不能超过200' })
  spec?: string;

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

  @IsNotEmpty({ message: '出库数量不能为空' })
  @IsNumber({}, { message: '出库数量必须为数字' })
  quantity: number;

  @IsOptional()
  @IsNumber({}, { message: '单价必须为数字' })
  unitPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: '金额必须为数字' })
  amount?: number;

  @IsOptional()
  @IsString({ message: '批号必须为字符串' })
  @MaxLength(50, { message: '批号长度不能超过50' })
  lotNo?: string;

  @IsOptional()
  @IsString({ message: '库位必须为字符串' })
  @MaxLength(100, { message: '库位长度不能超过100' })
  location?: string;

  @IsOptional()
  @IsDate({ message: '出库日期必须为日期格式' })
  outDate?: Date;

  @IsOptional()
  @IsString({ message: '备注必须为字符串' })
  remark?: string;
}

export class UpdateInventoryOutDto {
  @IsOptional()
  @IsNumber({}, { message: '出库数量必须为数字' })
  quantity?: number;

  @IsOptional()
  @IsNumber({}, { message: '单价必须为数字' })
  unitPrice?: number;

  @IsOptional()
  @IsNumber({}, { message: '金额必须为数字' })
  amount?: number;

  @IsOptional()
  @IsString({ message: '批号必须为字符串' })
  @MaxLength(50, { message: '批号长度不能超过50' })
  lotNo?: string;

  @IsOptional()
  @IsString({ message: '库位必须为字符串' })
  @MaxLength(100, { message: '库位长度不能超过100' })
  location?: string;

  @IsOptional()
  @IsDate({ message: '出库日期必须为日期格式' })
  outDate?: Date;

  @IsOptional()
  @IsString({ message: '备注必须为字符串' })
  remark?: string;
}