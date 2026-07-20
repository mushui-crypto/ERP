import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('hr_performance_plan')
export class PerformancePlan extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'plan_no', length: 50, comment: '绩效计划编号' })
  planNo: string;

  @Column({ name: 'org_id', length: 36, comment: '组织ID' })
  orgId: string;

  @Column({ name: 'department_id', length: 36, comment: '部门ID' })
  departmentId: string;

  @Column({ name: 'department_name', length: 200, comment: '部门名称' })
  departmentName: string;

  @Column({ length: 200, comment: '计划名称' })
  title: string;

  @Column({ name: 'plan_type', length: 50, comment: '计划类型: annual-年度 quarter-季度 month-月度' })
  planType: string;

  @Column({ name: 'period', length: 20, comment: '评估周期' })
  period: string;

  @Column({ name: 'start_date', type: 'datetime', comment: '开始日期' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'datetime', comment: '结束日期' })
  endDate: Date;

  @Column({ name: 'self_assessment_deadline', type: 'datetime', comment: '自评截止日期' })
  selfAssessmentDeadline: Date;

  @Column({ name: 'supervisor_assessment_deadline', type: 'datetime', comment: '上级评估截止日期' })
  supervisorAssessmentDeadline: Date;

  @Column({ name: 'review_deadline', type: 'datetime', comment: '评审截止日期' })
  reviewDeadline: Date;

  @Column({ type: 'text', nullable: true, comment: '评估标准说明' })
  description: string;

  @Column({ type: 'int', default: 0, comment: '状态: 0-草稿 1-已发布 2-自评中 3-评估中 4-评审中 5-已完成' })
  status: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}