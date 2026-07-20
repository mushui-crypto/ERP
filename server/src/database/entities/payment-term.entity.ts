import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('master_payment_term')
export class PaymentTerm extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'term_code', length: 50, comment: '付款条件编码' })
  termCode: string;

  @Column({ name: 'term_name', length: 100, comment: '付款条件名称' })
  termName: string;

  @Column({ name: 'term_type', type: 'int', default: 1, comment: '付款类型: 1-预付 2-货到付款 3-月结 4-票期' })
  termType: number;

  @Column({ name: 'credit_days', type: 'int', default: 30, comment: '信用天数' })
  creditDays: number;

  @Column({ name: 'advance_ratio', type: 'decimal', precision: 5, scale: 2, default: 0, comment: '预付比例' })
  advanceRatio: number;

  @Column({ name: 'stage1_ratio', type: 'decimal', precision: 5, scale: 2, default: 0, comment: '阶段1比例' })
  stage1Ratio: number;

  @Column({ name: 'stage2_ratio', type: 'decimal', precision: 5, scale: 2, default: 0, comment: '阶段2比例' })
  stage2Ratio: number;

  @Column({ name: 'stage3_ratio', type: 'decimal', precision: 5, scale: 2, default: 0, comment: '阶段3比例' })
  stage3Ratio: number;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
