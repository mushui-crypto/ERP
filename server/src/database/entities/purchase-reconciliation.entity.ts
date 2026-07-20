import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchaseReconciliationEntry } from './purchase-reconciliation-entry.entity';

@Entity('biz_purchase_reconciliation')
@Index('UQ_purchase_reconciliation_idempotency', ['idempotencyKey'], { unique: true })
@Index('UQ_purchase_reconciliation_active_scope', ['activeScopeKey'], {
  unique: true,
  where: 'active_scope_key IS NOT NULL',
})
export class PurchaseReconciliation extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'reconciliation_no', length: 50 }) reconciliationNo: string;
  @Column({ name: 'idempotency_key', length: 100 }) idempotencyKey: string;
  @Column({ name: 'payload_hash', length: 64 }) payloadHash: string;
  @Column({ name: 'scope_key', length: 64 }) scopeKey: string;
  @Column({ name: 'active_scope_key', length: 64, nullable: true }) activeScopeKey: string;
  @Column({ name: 'supplier_id', length: 36 }) supplierId: string;
  @Column({ name: 'purchase_org_id', length: 36 }) purchaseOrgId: string;
  @Column({ name: 'settle_org_id', length: 36 }) settleOrgId: string;
  @Column({ name: 'currency_id', length: 36 }) currencyId: string;
  @Column({ name: 'period_start', type: 'datetime' }) periodStart: Date;
  @Column({ name: 'period_end', type: 'datetime' }) periodEnd: Date;
  @Column({ name: 'purchase_order_id', length: 36, nullable: true }) purchaseOrderId: string;
  @Column({ name: 'purchase_order_no', type: 'nvarchar', length: 50, nullable: true }) purchaseOrderNo: string;
  @Column({ name: 'reconciliation_date', type: 'datetime' }) reconciliationDate: Date;
  @Column({ length: 30, default: 'PURCHASE_ORG' }) initiator: string;
  @Column({ name: 'include_generated_payables', default: true }) includeGeneratedPayables: boolean;
  @Column({ type: 'int', default: 0 }) status: number;
  @Column({ name: 'business_qty', type: 'decimal', precision: 18, scale: 4, default: 0 }) businessQty: number;
  @Column({ name: 'business_untaxed_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) businessUntaxedAmount: number;
  @Column({ name: 'business_tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) businessTaxAmount: number;
  @Column({ name: 'business_total_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) businessTotalAmount: number;
  @Column({ name: 'payable_qty', type: 'decimal', precision: 18, scale: 4, default: 0 }) payableQty: number;
  @Column({ name: 'payable_untaxed_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) payableUntaxedAmount: number;
  @Column({ name: 'payable_tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) payableTaxAmount: number;
  @Column({ name: 'payable_total_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) payableTotalAmount: number;
  @Column({ name: 'difference_qty', type: 'decimal', precision: 18, scale: 4, default: 0 }) differenceQty: number;
  @Column({ name: 'difference_untaxed_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) differenceUntaxedAmount: number;
  @Column({ name: 'difference_tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) differenceTaxAmount: number;
  @Column({ name: 'difference_total_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) differenceTotalAmount: number;
  @Column({ name: 'confirmed_qty', type: 'decimal', precision: 18, scale: 4, nullable: true }) confirmedQty: number;
  @Column({ name: 'confirmed_untaxed_amount', type: 'decimal', precision: 18, scale: 2, nullable: true }) confirmedUntaxedAmount: number;
  @Column({ name: 'confirmed_tax_amount', type: 'decimal', precision: 18, scale: 2, nullable: true }) confirmedTaxAmount: number;
  @Column({ name: 'confirmed_total_amount', type: 'decimal', precision: 18, scale: 2, nullable: true }) confirmedTotalAmount: number;
  @Column({ name: 'confirmed_at', type: 'datetime', nullable: true }) confirmedAt: Date;
  @Column({ name: 'confirmed_by', length: 50, nullable: true }) confirmedBy: string;
  @Column({ name: 'canceled_at', type: 'datetime', nullable: true }) canceledAt: Date;
  @Column({ name: 'canceled_by', length: 50, nullable: true }) canceledBy: string;
  @Column({ name: 'cancel_reason', type: 'nvarchar', length: 500, nullable: true }) cancelReason: string;
  @Column({ type: 'nvarchar', length: 1000, nullable: true }) remark: string;

  @OneToMany(() => PurchaseReconciliationEntry, (entry) => entry.purchaseReconciliation, { cascade: false })
  entries: PurchaseReconciliationEntry[];
}
