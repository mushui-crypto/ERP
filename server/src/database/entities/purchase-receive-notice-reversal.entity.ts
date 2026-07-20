import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchaseReceiveNoticeReversalEntry } from './purchase-receive-notice-reversal-entry.entity';

@Entity('biz_purchase_receive_notice_reversal')
export class PurchaseReceiveNoticeReversal extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'reversal_no', length: 50, comment: '收料通知冲销单号' })
  reversalNo: string;

  @Index({ unique: true })
  @Column({ name: 'source_notice_id', length: 36, comment: '被冲销收料通知ID；一张原单最多冲销一次' })
  sourceNoticeId: string;

  @Column({ name: 'source_notice_no', length: 50, comment: '被冲销收料通知单号' })
  sourceNoticeNo: string;

  @Column({ name: 'purchase_order_id', length: 36, comment: '来源采购订单ID' })
  purchaseOrderId: string;

  @Column({ name: 'purchase_order_no', length: 50, comment: '来源采购订单单号' })
  purchaseOrderNo: string;

  @Column({ name: 'purchase_org_id', length: 36, comment: '采购组织' })
  purchaseOrgId: string;

  @Column({ name: 'stock_org_id', length: 36, comment: '收料组织' })
  stockOrgId: string;

  @Column({ name: 'supplier_id', length: 36, comment: '供应商' })
  supplierId: string;

  @Column({ name: 'reversal_date', type: 'datetime', comment: '冲销时间' })
  reversalDate: Date;

  @Column({ length: 500, comment: '冲销原因' })
  reason: string;

  @Column({ name: 'operated_by', length: 50, nullable: true, comment: '冲销操作人' })
  operatedBy: string;

  @Index({ unique: true })
  @Column({ name: 'idempotency_key', length: 100, comment: '冲销请求幂等键' })
  idempotencyKey: string;

  @Column({ length: 20, default: 'COMPLETED', comment: '冲销记录状态；P0 固定为 COMPLETED' })
  status: string;

  @OneToMany(() => PurchaseReceiveNoticeReversalEntry, (entry) => entry.reversal, {
    cascade: false,
  })
  entries: PurchaseReceiveNoticeReversalEntry[];
}
