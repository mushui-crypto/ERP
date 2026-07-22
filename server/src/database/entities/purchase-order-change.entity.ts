import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchaseOrderChangeEntry } from './purchase-order-change-entry.entity';

@Entity('biz_purchase_order_change')
@Index('UQ_purchase_order_change_idempotency', ['idempotencyKey'], { unique: true })
@Index('UQ_purchase_order_change_active_order', ['activeOrderKey'], {
  unique: true,
  where: 'active_order_key IS NOT NULL',
})
export class PurchaseOrderChange extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'change_no', length: 50 })
  changeNo: string;

  @Column({ name: 'idempotency_key', length: 100 })
  idempotencyKey: string;

  @Column({ name: 'payload_hash', length: 64 })
  payloadHash: string;

  @Column({ name: 'active_order_key', length: 36, nullable: true })
  activeOrderKey: string;

  @Index()
  @Column({ name: 'source_order_id', length: 36 })
  sourceOrderId: string;

  @Column({ name: 'source_order_no', type: 'nvarchar', length: 50 })
  sourceOrderNo: string;

  @Column({ name: 'purchase_org_id', length: 36 })
  purchaseOrgId: string;

  @Column({ name: 'supplier_id', length: 36 })
  supplierId: string;

  @Column({ name: 'currency_id', length: 36, nullable: true })
  currencyId: string;

  @Column({ name: 'bill_type', length: 30 })
  billType: string;

  @Column({ name: 'business_type', length: 30 })
  businessType: string;

  @Column({ name: 'change_date', type: 'datetime' })
  changeDate: Date;

  @Column({ name: 'change_reason', type: 'nvarchar', length: 500 })
  changeReason: string;

  @Column({ type: 'int', default: 0 })
  status: number;

  @Column({ name: 'effective_status', length: 20, default: 'NOT_EFFECTIVE' })
  effectiveStatus: string;

  @Column({ name: 'effective_at', type: 'datetime', nullable: true })
  effectiveAt: Date;

  @Column({ name: 'effective_by', length: 50, nullable: true })
  effectiveBy: string;

  @Column({ name: 'approved_at', type: 'datetime', nullable: true })
  approvedAt: Date;

  @Column({ name: 'approved_by', length: 50, nullable: true })
  approvedBy: string;

  @Column({ name: 'rejected_at', type: 'datetime', nullable: true })
  rejectedAt: Date;

  @Column({ name: 'rejected_by', length: 50, nullable: true })
  rejectedBy: string;

  @Column({ name: 'reject_reason', type: 'nvarchar', length: 500, nullable: true })
  rejectReason: string;

  @Column({ name: 'canceled_at', type: 'datetime', nullable: true })
  canceledAt: Date;

  @Column({ name: 'canceled_by', length: 50, nullable: true })
  canceledBy: string;

  @Column({ name: 'cancel_reason', type: 'nvarchar', length: 500, nullable: true })
  cancelReason: string;

  @Column({ type: 'nvarchar', length: 1000, nullable: true })
  remark: string;

  @OneToMany(() => PurchaseOrderChangeEntry, (entry) => entry.purchaseOrderChange, { cascade: false })
  entries: PurchaseOrderChangeEntry[];
}
