import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('biz_quality_unqualified')
export class QualityUnqualified extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'unqualified_no', length: 50, comment: '不合格单编号' })
  unqualifiedNo: string;

  @Column({ name: 'inspection_id', length: 36, comment: '关联检验单ID' })
  inspectionId: string;

  @Column({ name: 'inspection_no', length: 50, comment: '关联检验单号' })
  inspectionNo: string;

  @Column({ name: 'material_id', length: 36, comment: '物料ID' })
  materialId: string;

  @Column({ name: 'material_code', length: 50, comment: '物料编码' })
  materialCode: string;

  @Column({ name: 'material_name', length: 200, comment: '物料名称' })
  materialName: string;

  @Column({ name: 'batch_no', length: 50, nullable: true, comment: '批次号' })
  batchNo: string;

  @Column({ name: 'unqualified_qty', type: 'decimal', precision: 18, scale: 4, comment: '不合格数量' })
  unqualifiedQty: number;

  @Column({ name: 'unqualified_rate', type: 'decimal', precision: 5, scale: 2, comment: '不合格率(%)' })
  unqualifiedRate: number;

  @Column({ name: 'defect_type', length: 100, nullable: true, comment: '缺陷类型' })
  defectType: string;

  @Column({ name: 'defect_description', type: 'text', nullable: true, comment: '缺陷描述' })
  defectDescription: string;

  @Column({ name: 'root_cause', type: 'text', nullable: true, comment: '根本原因' })
  rootCause: string;

  @Column({ name: 'disposal_method', comment: '处理方式: 1-返工 2-返修 3-报废 4-让步接收 5-退货' })
  disposalMethod: number;

  @Column({ name: 'disposal_qty', type: 'decimal', precision: 18, scale: 4, nullable: true, comment: '处理数量' })
  disposalQty: number;

  @Column({ name: 'disposal_date', type: 'datetime', nullable: true, comment: '处理日期' })
  disposalDate: Date;

  @Column({ name: 'disposal_person', length: 50, nullable: true, comment: '处理人' })
  disposalPerson: string;

  @Column({ type: 'int', default: 0, comment: '状态: 0-待处理 1-处理中 2-已完成 3-已关闭' })
  status: number;

  @Column({ name: 'corrective_action', type: 'text', nullable: true, comment: '纠正措施' })
  correctiveAction: string;

  @Column({ name: 'preventive_action', type: 'text', nullable: true, comment: '预防措施' })
  preventiveAction: string;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}