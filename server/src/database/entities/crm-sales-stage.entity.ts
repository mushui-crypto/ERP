import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('crm_sales_stage')
export class CrmSalesStage extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'stage_code', length: 50, comment: '阶段编码' })
  stageCode: string;

  @Column({ name: 'stage_name', length: 100, comment: '阶段名称' })
  stageName: string;

  @Column({ type: 'int', comment: '阶段顺序' })
  sortOrder: number;

  @Column({ name: 'probability', type: 'decimal', precision: 5, scale: 2, comment: '成功率(%)' })
  probability: number;

  @Column({ type: 'int', default: 1, comment: '是否启用: 1-启用 0-禁用' })
  enabled: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}