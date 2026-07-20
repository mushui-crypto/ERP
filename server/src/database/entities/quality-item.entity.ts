import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('master_quality_item')
export class QualityItem extends BaseEntity {
  @Column({ name: 'standard_id', length: 36, comment: '检验标准ID' })
  standardId: string;

  @Column({ name: 'item_code', length: 50, comment: '项目编码' })
  itemCode: string;

  @Column({ name: 'item_name', length: 200, comment: '项目名称' })
  itemName: string;

  @Column({ name: 'item_type', length: 50, nullable: true, comment: '项目类型' })
  itemType: string;

  @Column({ name: 'unit', length: 50, nullable: true, comment: '单位' })
  unit: string;

  @Column({ name: 'upper_limit', type: 'decimal', precision: 18, scale: 6, nullable: true, comment: '上限值' })
  upperLimit: number;

  @Column({ name: 'lower_limit', type: 'decimal', precision: 18, scale: 6, nullable: true, comment: '下限值' })
  lowerLimit: number;

  @Column({ name: 'target_value', type: 'decimal', precision: 18, scale: 6, nullable: true, comment: '目标值' })
  targetValue: number;

  @Column({ name: 'inspection_method', length: 200, nullable: true, comment: '检验方法' })
  inspectionMethod: string;

  @Column({ name: 'measurement_tool', length: 100, nullable: true, comment: '测量工具' })
  measurementTool: string;

  @Column({ name: 'is_key',  default: 0, comment: '是否关键特性' })
  isKey: number;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;
}