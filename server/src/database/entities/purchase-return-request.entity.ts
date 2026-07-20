import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchaseReturnRequestEntry } from './purchase-return-request-entry.entity';

@Entity('biz_purchase_return_request')
@Index('UQ_purchase_return_request_idempotency', ['idempotencyKey'], { unique: true })
export class PurchaseReturnRequest extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'request_no', length: 50, comment: '退料申请单号' })
  requestNo: string;

  @Column({ name: 'idempotency_key', length: 100, comment: '入库下推退料申请幂等键' })
  idempotencyKey: string;

  @Column({ name: 'payload_hash', length: 64, nullable: true, comment: '创建请求规范化载荷SHA-256' })
  payloadHash: string;

  @Column({ name: 'purchase_org_id', length: 36, comment: '采购组织' })
  purchaseOrgId: string;

  @Column({ name: 'stock_org_id', length: 36, comment: '退料库存组织' })
  stockOrgId: string;

  @Column({ name: 'settle_org_id', length: 36, nullable: true, comment: '结算组织' })
  settleOrgId: string;

  @Column({ name: 'supplier_id', length: 36, comment: '供应商' })
  supplierId: string;

  @Column({ name: 'currency_id', length: 36, nullable: true, comment: '结算币别' })
  currencyId: string;

  @Column({ name: 'return_mode', length: 20, comment: '退料方式：REPLENISH/DEDUCTION' })
  returnMode: string;

  @Column({ name: 'request_date', type: 'datetime', comment: '申请日期' })
  requestDate: Date;

  @Column({ name: 'reason', length: 500, comment: '退料原因' })
  reason: string;

  @Column({ type: 'int', default: 0, comment: '状态：0草稿 1待审核 2已审核 4已取消 5已关闭 6已驳回' })
  status: number;

  @Column({ name: 'approved_at', type: 'datetime', nullable: true, comment: '审核时间' })
  approvedAt: Date;

  @Column({ name: 'approved_by', length: 50, nullable: true, comment: '审核人' })
  approvedBy: string;

  @Column({ length: 1000, nullable: true, comment: '备注' })
  remark: string;

  @OneToMany(() => PurchaseReturnRequestEntry, (entry) => entry.purchaseReturnRequest, { cascade: false })
  entries: PurchaseReturnRequestEntry[];
}
