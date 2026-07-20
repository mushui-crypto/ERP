import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { AssetAcceptanceEntry } from './asset-acceptance-entry.entity';

@Entity('biz_asset_acceptance')
@Index('UQ_asset_acceptance_idempotency', ['idempotencyKey'], { unique: true })
export class AssetAcceptance extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'acceptance_no', length: 50 }) acceptanceNo: string;
  @Column({ name: 'idempotency_key', length: 100 }) idempotencyKey: string;
  @Column({ name: 'payload_hash', length: 64 }) payloadHash: string;
  @Column({ name: 'business_type', length: 30 }) businessType: string;
  @Column({ name: 'source_type', length: 30 }) sourceType: string;
  @Column({ name: 'source_id', length: 36 }) sourceId: string;
  @Column({ name: 'source_no', length: 50 }) sourceNo: string;
  @Column({ name: 'org_id', length: 36 }) orgId: string;
  @Column({ name: 'purchase_org_id', length: 36 }) purchaseOrgId: string;
  @Column({ name: 'stock_org_id', length: 36, nullable: true }) stockOrgId: string;
  @Column({ name: 'settle_org_id', length: 36, nullable: true }) settleOrgId: string;
  @Column({ name: 'supplier_id', length: 36 }) supplierId: string;
  @Column({ name: 'currency_id', length: 36, nullable: true }) currencyId: string;
  @Column({ name: 'payment_term_id', length: 36, nullable: true }) paymentTermId: string;
  @Column({ name: 'acceptance_date', type: 'datetime' }) acceptanceDate: Date;
  @Column({ name: 'department_id', length: 36, nullable: true }) departmentId: string;
  @Column({ name: 'acceptor_id', length: 36, nullable: true }) acceptorId: string;
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 }) amount: number;
  @Column({ name: 'tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) taxAmount: number;
  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) totalAmount: number;
  @Column({ type: 'int', default: 0 }) status: number;
  @Column({ name: 'approved_at', type: 'datetime', nullable: true }) approvedAt: Date;
  @Column({ name: 'approved_by', length: 50, nullable: true }) approvedBy: string;
  @Column({ name: 'payable_generation_status', length: 30, default: 'NOT_REQUIRED' }) payableGenerationStatus: string;
  @Column({ name: 'payable_id', length: 36, nullable: true }) payableId: string;
  @Column({ name: 'payable_no', length: 50, nullable: true }) payableNo: string;
  @Column({ name: 'payable_generation_error', length: 1000, nullable: true }) payableGenerationError: string;
  @Column({ name: 'payable_generation_failed_at', type: 'datetime', nullable: true }) payableGenerationFailedAt: Date;
  @Column({ name: 'payable_generated_at', type: 'datetime', nullable: true }) payableGeneratedAt: Date;
  @Column({ name: 'asset_card_generation_status', length: 30, default: 'NOT_GENERATED' }) assetCardGenerationStatus: string;
  @Column({ name: 'asset_card_generation_error', length: 1000, nullable: true }) assetCardGenerationError: string;
  @Column({ name: 'asset_card_generation_failed_at', type: 'datetime', nullable: true }) assetCardGenerationFailedAt: Date;
  @Column({ name: 'asset_card_generated_at', type: 'datetime', nullable: true }) assetCardGeneratedAt: Date;
  @Column({ name: 'out_request_id', length: 36, nullable: true }) outRequestId: string;
  @Column({ name: 'out_request_no', length: 50, nullable: true }) outRequestNo: string;
  @Column({ length: 1000, nullable: true }) remark: string;

  @OneToMany(() => AssetAcceptanceEntry, (entry) => entry.assetAcceptance, { cascade: false })
  entries: AssetAcceptanceEntry[];
}
