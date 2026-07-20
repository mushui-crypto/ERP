import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateProductionOrderDto {
  @ApiProperty({ description: '物料ID', required: true })
  @IsString()
  materialId: string;

  @ApiProperty({ description: 'BOM ID', required: false })
  @IsOptional()
  @IsString()
  bomId?: string;

  @ApiProperty({ description: '工艺路线ID', required: false })
  @IsOptional()
  @IsString()
  routingId?: string;

  @ApiProperty({ description: '生产数量', required: true })
  @IsNumber()
  quantity: number;

  @ApiProperty({ description: '计划开始日期', required: true })
  @IsString()
  plannedStartDate: string;

  @ApiProperty({ description: '计划结束日期', required: true })
  @IsString()
  plannedEndDate: string;

  @ApiProperty({ description: '仓库ID', required: false })
  @IsOptional()
  @IsString()
  warehouseId?: string;

  @ApiProperty({ description: '优先级: 1-紧急 2-正常 3-低', required: false })
  @IsOptional()
  @IsNumber()
  priority?: number;

  @ApiProperty({ description: '备注', required: false })
  @IsOptional()
  @IsString()
  remark?: string;
}

export class UpdateProductionOrderDto extends CreateProductionOrderDto {
  @ApiProperty({ description: '完工数量', required: false })
  @IsOptional()
  @IsNumber()
  completedQty?: number;

  @ApiProperty({ description: '报废数量', required: false })
  @IsOptional()
  @IsNumber()
  scrappedQty?: number;

  @ApiProperty({ description: '状态', required: false })
  @IsOptional()
  @IsNumber()
  status?: number;
}