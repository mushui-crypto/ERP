import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('fin_budget_item')
export class FinBudgetItem extends BaseEntity {
  @Column({ name: 'budget_id', length: 36, comment: '预算ID' })
  budgetId: string;

  @Column({ name: 'budget_no', length: 50, comment: '预算编号' })
  budgetNo: string;

  @Column({ name: 'item_code', length: 50, comment: '预算项目编码' })
  itemCode: string;

  @Column({ name: 'item_name', length: 200, comment: '预算项目名称' })
  itemName: string;

  @Column({ name: 'parent_code', length: 50, nullable: true, comment: '上级项目编码' })
  parentCode: string;

  @Column({ name: 'budget_amount', type: 'decimal', precision: 18, scale: 2, comment: '预算金额' })
  budgetAmount: number;

  @Column({ name: 'actual_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '实际金额' })
  actualAmount: number;

  @Column({ name: 'balance', type: 'decimal', precision: 18, scale: 2, comment: '预算余额' })
  balance: number;

  @Column({ name: 'variance', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '偏差金额' })
  variance: number;

  @Column({ name: 'variance_rate', type: 'decimal', precision: 10, scale: 2, default: 0, comment: '偏差率(%)' })
  varianceRate: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}