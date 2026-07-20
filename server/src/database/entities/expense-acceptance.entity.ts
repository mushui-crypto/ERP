import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ExpenseAcceptanceEntry } from './expense-acceptance-entry.entity';

@Entity('biz_expense_acceptance')
@Index('UQ_expense_acceptance_idempotency', ['idempotencyKey'], { unique: true })
export class ExpenseAcceptance extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'acceptance_no', length: 50 })
  acceptanceNo: string;

  @Column({ name: 'idempotency_key', length: 100 })
  idempotencyKey: string;

  @Column({ name: 'payload_hash', length: 64 })
  payloadHash: string;

  @Column({ name: 'business_type', length: 30, default: 'EXPENSE_PURCHASE' })
  businessType: string;

  @Column({ name: 'source_receive_notice_id', length: 36 })
  sourceReceiveNoticeId: string;

  @Column({ name: 'source_receive_notice_no', length: 50 })
  sourceReceiveNoticeNo: string;

  @Column({ name: 'org_id', length: 36 })
  orgId: string;

  @Column({ name: 'purchase_org_id', length: 36 })
  purchaseOrgId: string;

  @Column({ name: 'settle_org_id', length: 36 })
  settleOrgId: string;

  @Column({ name: 'supplier_id', length: 36 })
  supplierId: string;

  @Column({ name: 'currency_id', length: 36 })
  currencyId: string;

  @Column({ name: 'payment_term_id', length: 36 })
  paymentTermId: string;

  @Column({ name: 'acceptance_date', type: 'datetime' })
  acceptanceDate: Date;

  @Column({ name: 'department_id', length: 36, nullable: true })
  departmentId: string;

  @Column({ name: 'acceptor_id', length: 36, nullable: true })
  acceptorId: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  amount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'int', default: 0 })
  status: number;

  @Column({ name: 'approved_at', type: 'datetime', nullable: true })
  approvedAt: Date;

  @Column({ name: 'approved_by', length: 50, nullable: true })
  approvedBy: string;

  @Column({ name: 'payable_generation_status', length: 30, default: 'NOT_GENERATED' })
  payableGenerationStatus: string;

  @Column({ name: 'payable_id', length: 36, nullable: true })
  payableId: string;

  @Column({ name: 'payable_no', length: 50, nullable: true })
  payableNo: string;

  @Column({ name: 'payable_generation_error', length: 1000, nullable: true })
  payableGenerationError: string;

  @Column({ name: 'payable_generation_failed_at', type: 'datetime', nullable: true })
  payableGenerationFailedAt: Date;

  @Column({ name: 'payable_generated_at', type: 'datetime', nullable: true })
  payableGeneratedAt: Date;

  @Column({ length: 1000, nullable: true })
  remark: string;

  @OneToMany(() => ExpenseAcceptanceEntry, (entry) => entry.expenseAcceptance, { cascade: false })
  entries: ExpenseAcceptanceEntry[];
}
