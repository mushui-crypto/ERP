import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateInventoryDto {
  @ApiProperty({ description: '仓库ID', required: true })
  @IsString()
  warehouseId: string;

  @ApiProperty({ description: '物料ID', required: true })
  @IsString()
  materialId: string;

  @ApiProperty({ description: '批次号', required: false })
  @IsOptional()
  @IsString()
  batchNo?: string;

  @ApiProperty({ description: '序列号', required: false })
  @IsOptional()
  @IsString()
  serialNo?: string;

  @ApiProperty({ description: '库存数量', required: false })
  @IsOptional()
  @IsNumber()
  quantity?: number;

  @ApiProperty({ description: '锁定数量', required: false })
  @IsOptional()
  @IsNumber()
  lockedQty?: number;

  @ApiProperty({ description: '可用数量', required: false })
  @IsOptional()
  @IsNumber()
  availableQty?: number;

  @ApiProperty({ description: '单位成本', required: false })
  @IsOptional()
  @IsNumber()
  unitCost?: number;

  @ApiProperty({ description: '总成本', required: false })
  @IsOptional()
  @IsNumber()
  totalCost?: number;

  @ApiProperty({ description: '入库日期', required: false })
  @IsOptional()
  inboundDate?: Date;

  @ApiProperty({ description: '过期日期', required: false })
  @IsOptional()
  expiryDate?: Date;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;
}

export class UpdateInventoryDto extends CreateInventoryDto {}

export class InventoryAdjustDto {
  @ApiProperty({ description: '调整数量', required: true })
  @IsNumber()
  adjustQty: number;

  @ApiProperty({ description: '调整类型: 1-入库 2-出库', required: true })
  @IsNumber()
  adjustType: number;

  @ApiProperty({ description: '调整原因', required: false })
  @IsOptional()
  @IsString()
  reason?: string;
}