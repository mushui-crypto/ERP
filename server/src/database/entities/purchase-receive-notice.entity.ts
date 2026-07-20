import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchaseReceiveNoticeEntry } from './purchase-receive-notice-entry.entity';

@Entity('biz_purchase_receive_notice')
@Index(['purchaseOrderId', 'receiveBatchNo'], { unique: true })
export class PurchaseReceiveNotice extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'notice_no', length: 50, comment: '收料/请检通知单号/FBillNo' })
  noticeNo: string;

  @Column({ name: 'receive_batch_no', length: 100, comment: '收料批次号；订单下推幂等键组成部分' })
  receiveBatchNo: string;

  @Column({ name: 'purchase_order_id', length: 36, comment: '来源采购订单表头ID' })
  purchaseOrderId: string;

  @Column({ name: 'purchase_order_no', length: 50, comment: '来源采购订单单号/FOrderBillNo' })
  purchaseOrderNo: string;

  @Column({ name: 'stock_org_id', length: 36, comment: '收料组织/FStockOrgId' })
  stockOrgId: string;

  @Column({ name: 'purchase_org_id', length: 36, comment: '采购组织/FPurOrgId' })
  purchaseOrgId: string;

  @Column({ name: 'supplier_id', length: 36, comment: '供应商/FSupplierId' })
  supplierId: string;

  @Column({ name: 'receive_date', type: 'datetime', comment: '收料日期/FDate' })
  receiveDate: Date;

  @Column({ name: 'send_bill_no', length: 100, nullable: true, comment: '送货单号/FSendBillNo' })
  sendBillNo: string;

  @Column({ name: 'lad_bill_no', length: 100, nullable: true, comment: '提货单号/FLadBillNo' })
  ladBillNo: string;

  @Column({ name: 'need_check', default: true, comment: '整单需要检验/FNeedCheck' })
  needCheck: boolean;

  @Column({ name: 'receiver_id', length: 36, nullable: true, comment: '收料员/FReceiverId' })
  receiverId: string;

  @Column({ name: 'receive_department_id', length: 36, nullable: true, comment: '收料部门/FReceiveDeptId' })
  receiveDepartmentId: string;

  @Column({ type: 'int', default: 0, comment: '状态: 0草稿 1待审核 2已审核 3已取消 4已关闭 5已驳回 6已冲销' })
  status: number;

  @Column({ name: 'approved_at', type: 'datetime', nullable: true, comment: '审核时间/FApproveDate' })
  approvedAt: Date;

  @Column({ name: 'approved_by', length: 50, nullable: true, comment: '审核人/FApproverId' })
  approvedBy: string;

  @Column({ name: 'reversal_id', length: 36, nullable: true, comment: '关联收料通知冲销记录ID' })
  reversalId: string;

  @Column({ name: 'reversal_no', length: 50, nullable: true, comment: '关联收料通知冲销单号' })
  reversalNo: string;

  @Column({ name: 'reversed_at', type: 'datetime', nullable: true, comment: '冲销时间' })
  reversedAt: Date;

  @Column({ name: 'reversed_by', length: 50, nullable: true, comment: '冲销操作人' })
  reversedBy: string;

  @Column({ type: 'text', nullable: true, comment: '备注/FNote' })
  remark: string;

  @OneToMany(() => PurchaseReceiveNoticeEntry, (entry) => entry.purchaseReceiveNotice, {
    cascade: false,
  })
  entries: PurchaseReceiveNoticeEntry[];
}
