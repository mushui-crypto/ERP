import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('plm_ecn')
export class PlmEcn extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'ecn_no', length: 50, comment: '变更单号' })
  ecnNo: string;

  @Column({ name: 'ecn_name', length: 200, comment: '变更名称' })
  ecnName: string;

  @Column({ name: 'change_type', type: 'int', comment: '变更类型: 1-设计变更 2-工艺变更 3-材料变更 4-图纸变更' })
  changeType: number;

  @Column({ type: 'text', comment: '变更原因' })
  reason: string;

  @Column({ name: 'impact_analysis', type: 'text', nullable: true, comment: '影响分析' })
  impactAnalysis: string;

  @Column({ name: 'material_id', length: 36, nullable: true, comment: '物料ID' })
  materialId: string;

  @Column({ length: 50, nullable: true, comment: '申请人' })
  applicant: string;

  @Column({ name: 'apply_date', type: 'datetime', comment: '申请日期' })
  applyDate: Date;

  @Column({ name: 'planned_date', type: 'datetime', nullable: true, comment: '计划完成日期' })
  plannedDate: Date;

  @Column({ type: 'int', default: 0, comment: '状态: 0-申请 1-审核中 2-已批准 3-已执行 4-已拒绝' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
