import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchaseReturnEntry } from './purchase-return-entry.entity';

@Entity('biz_purchase_return')
@Index('UQ_purchase_return_idempotency', ['idempotencyKey'], { unique: true })
export class PurchaseReturn extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'return_no', length: 50, comment: '采购退料单号' })
  returnNo: string;

  @Column({ name: 'idempotency_key', length: 100, comment: '下推采购退料幂等键' })
  idempotencyKey: string;

  @Column({ name: 'source_type', length: 30, comment: '来源：INVENTORY_IN/RETURN_REQUEST' })
  sourceType: string;

  @Column({ name: 'source_return_request_id', length: 36, nullable: true, comment: '来源退料申请ID' })
  sourceReturnRequestId: string;

  @Column({ name: 'source_return_request_no', length: 50, nullable: true, comment: '来源退料申请单号' })
  sourceReturnRequestNo: string;

  @Column({ name: 'purchase_org_id', length: 36, comment: '采购组织' })
  purchaseOrgId: string;

  @Column({ name: 'stock_org_id', length: 36, comment: '库存组织' })
  stockOrgId: string;

  @Column({ name: 'settle_org_id', length: 36, nullable: true, comment: '结算组织' })
  settleOrgId: string;

  @Column({ name: 'supplier_id', length: 36, comment: '供应商' })
  supplierId: string;

  @Column({ name: 'currency_id', length: 36, nullable: true, comment: '结算币别' })
  currencyId: string;

  @Column({ name: 'payment_term_id', length: 36, nullable: true, comment: '付款条件' })
  paymentTermId: string;

  @Column({ name: 'return_mode', length: 20, comment: '退料方式：REPLENISH/DEDUCTION' })
  returnMode: string;

  @Column({ name: 'return_date', type: 'datetime', comment: '退料日期' })
  returnDate: Date;

  @Column({ name: 'reason', length: 500, comment: '退料原因' })
  reason: string;

  @Column({ name: 'untaxed_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '未税金额' })
  untaxedAmount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '税额' })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '价税合计' })
  totalAmount: number;

  @Column({ type: 'int', default: 0, comment: '状态：0草稿 1待审核 2已审核 4已取消 5已关闭 6已驳回' })
  status: number;

  @Column({ name: 'approved_at', type: 'datetime', nullable: true, comment: '审核时间' })
  approvedAt: Date;

  @Column({ name: 'approved_by', length: 50, nullable: true, comment: '审核人' })
  approvedBy: string;

  @Column({ name: 'payable_generation_status', length: 30, default: 'NOT_REQUIRED', comment: '红字应付生成状态' })
  payableGenerationStatus: string;

  @Column({ name: 'payable_id', length: 36, nullable: true, comment: '红字应付ID' })
  payableId: string;

  @Column({ name: 'payable_no', length: 50, nullable: true, comment: '红字应付单号' })
  payableNo: string;

  @Column({ name: 'payable_generation_error', length: 1000, nullable: true, comment: '红字应付失败原因' })
  payableGenerationError: string;

  @Column({ name: 'payable_generation_failed_at', type: 'datetime', nullable: true, comment: '红字应付失败时间' })
  payableGenerationFailedAt: Date;

  @Column({ name: 'payable_generated_at', type: 'datetime', nullable: true, comment: '红字应付成功时间' })
  payableGeneratedAt: Date;

  @Column({ name: 'replenish_notice_id', length: 36, nullable: true, comment: '补料收料通知ID' })
  replenishNoticeId: string;

  @Column({ name: 'replenish_notice_no', length: 50, nullable: true, comment: '补料收料通知单号' })
  replenishNoticeNo: string;

  @Column({ length: 1000, nullable: true, comment: '备注' })
  remark: string;

  @OneToMany(() => PurchaseReturnEntry, (entry) => entry.purchaseReturn, { cascade: false })
  entries: PurchaseReturnEntry[];
}
