import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PayableEntry } from './payable-entry.entity';

@Entity('fin_payable')
@Index('UQ_fin_payable_estimate_source', ['payableType', 'sourceType', 'sourceId'], { unique: true })
export class Payable extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'payable_no', length: 50, comment: '应付单号' })
  payableNo: string;

  @Index()
  @Column({ name: 'supplier_id', length: 36, comment: '供应商ID' })
  supplierId: string;

  @Column({ name: 'payable_type', length: 30, default: 'STANDARD', comment: '立账类型：STANDARD/ESTIMATED' })
  payableType: string;

  @Column({ name: 'source_type', length: 50, comment: '来源类型；采购暂估为 PURCHASE_INBOUND' })
  sourceType: string;

  @Column({ name: 'source_id', length: 36, comment: '来源单据ID；无业务来源时回填本应付ID以满足幂等唯一约束' })
  sourceId: string;

  @Column({ name: 'source_no', length: 50, nullable: true, comment: '来源单据编号' })
  sourceNo: string;

  @Column({ name: 'currency_id', length: 36, nullable: true, comment: '结算币别' })
  currencyId: string;

  @Column({ name: 'settle_org_id', length: 36, nullable: true, comment: '结算组织' })
  settleOrgId: string;

  @Column({ name: 'payment_term_id', length: 36, nullable: true, comment: '付款条件' })
  paymentTermId: string;

  @Column({ name: 'untaxed_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '未税金额' })
  untaxedAmount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '税额' })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, comment: '应付金额/价税合计' })
  amount: number;

  @Column({ name: 'paid_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '已付金额' })
  paidAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, comment: '余额' })
  balance: number;

  @Column({ name: 'payable_date', type: 'datetime', comment: '应付日期' })
  payableDate: Date;

  @Column({ name: 'due_date', type: 'datetime', comment: '到期日期' })
  dueDate: Date;

  @Column({ length: 20, nullable: true, comment: '会计期间' })
  period: string;

  @Column({ type: 'int', default: 0, comment: '状态: 0-未结算 1-部分结算 2-已结算 3-逾期' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @OneToMany(() => PayableEntry, (entry) => entry.payable, { cascade: false })
  entries: PayableEntry[];
}
