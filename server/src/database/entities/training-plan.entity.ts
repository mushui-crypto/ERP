import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('hr_training_plan')
export class TrainingPlan extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'plan_no', length: 50, comment: '培训计划编号' })
  planNo: string;

  @Column({ name: 'org_id', length: 36, comment: '组织ID' })
  orgId: string;

  @Column({ name: 'department_id', length: 36, comment: '部门ID' })
  departmentId: string;

  @Column({ name: 'department_name', length: 200, comment: '部门名称' })
  departmentName: string;

  @Column({ length: 200, comment: '培训主题' })
  title: string;

  @Column({ name: 'training_type', length: 50, comment: '培训类型' })
  trainingType: string;

  @Column({ name: 'start_date', type: 'datetime', comment: '开始日期' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'datetime', comment: '结束日期' })
  endDate: Date;

  @Column({ name: 'location', length: 200, comment: '培训地点' })
  location: string;

  @Column({ name: 'trainer_id', length: 36, comment: '培训师ID' })
  trainerId: string;

  @Column({ name: 'trainer_name', length: 50, comment: '培训师姓名' })
  trainerName: string;

  @Column({ type: 'text', comment: '培训内容' })
  content: string;

  @Column({ type: 'int', comment: '预计人数' })
  expectedCount: number;

  @Column({ type: 'int', default: 0, comment: '实际人数' })
  actualCount: number;

  @Column({ name: 'budget', type: 'decimal', precision: 12, scale: 2, comment: '预算金额' })
  budget: number;

  @Column({ name: 'actual_cost', type: 'decimal', precision: 12, scale: 2, default: 0, comment: '实际费用' })
  actualCost: number;

  @Column({ type: 'int', default: 0, comment: '状态: 0-草稿 1-待审核 2-已批准 3-进行中 4-已完成 5-已取消' })
  status: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}