import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('fin_budget')
export class FinBudget extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'budget_no', length: 50, comment: '预算编号' })
  budgetNo: string;

  @Column({ name: 'budget_name', length: 200, comment: '预算名称' })
  budgetName: string;

  @Column({ name: 'budget_type', length: 50, comment: '预算类型: revenue-收入预算 expense-费用预算 capital-资本预算 cash-现金预算' })
  budgetType: string;

  @Column({ name: 'org_id', length: 36, nullable: true, comment: '组织ID' })
  orgId: string;

  @Column({ name: 'department_id', length: 36, nullable: true, comment: '部门ID' })
  departmentId: string;

  @Column({ name: 'cost_center_id', length: 36, nullable: true, comment: '成本中心ID' })
  costCenterId: string;

  @Column({ name: 'fiscal_year', length: 10, comment: '预算年度' })
  fiscalYear: string;

  @Column({ name: 'budget_amount', type: 'decimal', precision: 18, scale: 2, comment: '预算金额' })
  budgetAmount: number;

  @Column({ name: 'actual_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '实际金额' })
  actualAmount: number;

  @Column({ name: 'balance', type: 'decimal', precision: 18, scale: 2, comment: '预算余额' })
  balance: number;

  @Column({ type: 'int', default: 0, comment: '状态: 0-编制中 1-待审核 2-已批准 3-执行中 4-已完成 5-已作废' })
  status: number;

  @Column({ name: 'approved_by', length: 50, nullable: true, comment: '批准人' })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'datetime', nullable: true, comment: '批准时间' })
  approvedAt: Date;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}