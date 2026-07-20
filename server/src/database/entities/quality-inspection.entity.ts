import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('biz_quality_inspection')
@Index(['sourceReceiveNoticeEntryId'], { unique: true })
export class QualityInspection extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'inspection_no', length: 50, comment: '检验单号' })
  inspectionNo: string;

  @Column({ name: 'inspection_type', type: 'int', comment: '检验类型: 1-来料检验 2-过程检验 3-成品检验 4-出货检验' })
  inspectionType: number;

  @Column({ name: 'source_type', length: 50, nullable: true, comment: '来源类型' })
  sourceType: string;

  @Column({ name: 'source_id', length: 36, nullable: true, comment: '来源ID；来料检验时为收料通知明细ID' })
  sourceId: string;

  @Column({ name: 'source_receive_notice_id', length: 36, nullable: true, comment: '来源收料通知表头ID' })
  sourceReceiveNoticeId: string;

  @Column({ name: 'source_receive_notice_no', length: 50, nullable: true, comment: '来源收料通知单号' })
  sourceReceiveNoticeNo: string;

  @Column({ name: 'source_receive_notice_entry_id', length: 36, nullable: true, comment: '来源收料通知明细ID；一条明细一张来料检验单' })
  sourceReceiveNoticeEntryId: string;

  @Column({ name: 'material_id', length: 36, nullable: true, comment: '物料ID' })
  materialId: string;

  @Column({ name: 'material_code', length: 50, nullable: true, comment: '物料编码快照' })
  materialCode: string;

  @Column({ name: 'material_name', length: 200, nullable: true, comment: '物料名称快照' })
  materialName: string;

  @Column({ name: 'supplier_id', length: 36, nullable: true, comment: '供应商ID' })
  supplierId: string;

  @Column({ name: 'batch_no', length: 50, nullable: true, comment: '批次号' })
  batchNo: string;

  @Column({ name: 'inspection_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '本次检验数量' })
  inspectionQty: number;

  @Column({ name: 'sample_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '抽样数量' })
  sampleQty: number;

  @Column({ name: 'qualified_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '合格数量' })
  qualifiedQty: number;

  @Column({ name: 'unqualified_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '不合格数量；包含让步接收数量' })
  unqualifiedQty: number;

  @Column({ name: 'concession_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '让步接收数量；是不合格数量中的可入库子集' })
  concessionQty: number;

  @Column({ name: 'inspector', length: 50, nullable: true, comment: '检验员' })
  inspector: string;

  @Column({ name: 'inspection_date', type: 'datetime', comment: '检验日期' })
  inspectionDate: Date;

  @Column({ type: 'int', default: 0, comment: '检验结果: 0-待定 1-合格 2-不合格 3-让步接收' })
  result: number;

  @Column({ type: 'int', default: 0, comment: '审批状态: 0草稿 1待审核 2已审核 3已驳回' })
  status: number;

  @Column({ name: 'approved_by', length: 50, nullable: true, comment: '审核人' })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'datetime', nullable: true, comment: '审核时间' })
  approvedAt: Date;

  @Column({ name: 'result_applied_at', type: 'datetime', nullable: true, comment: '检验结果反写收料明细时间；非空表示已完成幂等回写' })
  resultAppliedAt: Date;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
