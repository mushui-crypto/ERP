import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('biz_bom_detail')
export class BomDetail extends BaseEntity {
  @Index()
  @Column({ name: 'bom_id', length: 36, comment: 'BOMID' })
  bomId: string;

  @Column({ name: 'material_id', length: 36, comment: '物料ID' })
  materialId: string;

  @Column({ name: 'quantity', type: 'decimal', precision: 18, scale: 6, comment: '用量' })
  quantity: number;

  @Column({ name: 'unit_id', length: 36, nullable: true, comment: '单位ID' })
  unitId: string;

  @Column({ name: 'scrap_rate', type: 'decimal', precision: 5, scale: 2, default: 0, comment: '损耗率(%)' })
  scrapRate: number;

  @Column({ name: 'is_substitute',  default: 0, comment: '是否替代料' })
  isSubstitute: number;

  @Column({ name: 'substitute_material_id', length: 36, nullable: true, comment: '替代物料ID' })
  substituteMaterialId: string;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
