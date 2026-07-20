import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('master_quality_standard')
export class QualityStandard extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'standard_code', length: 50, comment: '标准编码' })
  standardCode: string;

  @Column({ name: 'standard_name', length: 200, comment: '标准名称' })
  standardName: string;

  @Column({ name: 'material_id', length: 36, nullable: true, comment: '适用物料ID' })
  materialId: string;

  @Column({ name: 'material_code', length: 50, nullable: true, comment: '适用物料编码' })
  materialCode: string;

  @Column({ name: 'material_name', length: 200, nullable: true, comment: '适用物料名称' })
  materialName: string;

  @Column({ name: 'inspection_type', type: 'int', comment: '检验类型: 1-来料检验 2-过程检验 3-成品检验 4-出货检验' })
  inspectionType: number;

  @Column({ name: 'sample_method', length: 50, nullable: true, comment: '抽样方法' })
  sampleMethod: string;

  @Column({ name: 'sample_size', type: 'decimal', precision: 18, scale: 4, nullable: true, comment: '抽样数量' })
  sampleSize: number;

  @Column({ name: 'acceptance_level', type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '允收水平(%)' })
  acceptanceLevel: number;

  @Column({ name: 'rejection_level', type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '拒收水平(%)' })
  rejectionLevel: number;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '描述' })
  description: string;
}