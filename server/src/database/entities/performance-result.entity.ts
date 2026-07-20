import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('hr_performance_result')
export class PerformanceResult extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'result_no', length: 50, comment: '评估结果编号' })
  resultNo: string;

  @Column({ name: 'plan_id', length: 36, comment: '关联计划ID' })
  planId: string;

  @Column({ name: 'plan_no', length: 50, comment: '关联计划编号' })
  planNo: string;

  @Column({ name: 'plan_title', length: 200, comment: '计划名称' })
  planTitle: string;

  @Column({ name: 'emp_id', length: 36, comment: '员工ID' })
  empId: string;

  @Column({ name: 'emp_name', length: 50, comment: '员工姓名' })
  empName: string;

  @Column({ name: 'department_id', length: 36, comment: '部门ID' })
  departmentId: string;

  @Column({ name: 'department_name', length: 200, comment: '部门名称' })
  departmentName: string;

  @Column({ name: 'position_id', length: 36, comment: '职位ID' })
  positionId: string;

  @Column({ name: 'position_name', length: 200, comment: '职位名称' })
  positionName: string;

  @Column({ name: 'self_score', type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '自评分数' })
  selfScore: number;

  @Column({ type: 'text', nullable: true, comment: '自评说明' })
  selfComment: string;

  @Column({ name: 'supervisor_score', type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '上级评分' })
  supervisorScore: number;

  @Column({ type: 'text', nullable: true, comment: '上级评价' })
  supervisorComment: string;

  @Column({ name: 'final_score', type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '最终得分' })
  finalScore: number;

  @Column({ name: 'performance_level', length: 20, nullable: true, comment: '绩效等级: S-A-B-C-D' })
  performanceLevel: string;

  @Column({ name: 'bonus_ratio', type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '奖金系数' })
  bonusRatio: number;

  @Column({ type: 'text', nullable: true, comment: '改进建议' })
  improvementSuggestion: string;

  @Column({ type: 'int', default: 0, comment: '状态: 0-待自评 1-已自评 2-评估中 3-已评估 4-评审中 5-已完成' })
  status: number;
}