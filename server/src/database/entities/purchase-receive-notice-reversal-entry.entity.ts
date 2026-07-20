import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchaseReceiveNoticeReversal } from './purchase-receive-notice-reversal.entity';

@Entity('biz_purchase_receive_notice_reversal_entry')
@Index('UQ_biz_purchase_receive_notice_reversal_entry_header_line', ['reversalId', 'lineNo'], { unique: true })
@Index('UQ_biz_purchase_receive_notice_reversal_entry_source_entry', ['sourceNoticeEntryId'], { unique: true })
export class PurchaseReceiveNoticeReversalEntry extends BaseEntity {
  @Column({ name: 'reversal_id', type: 'uniqueidentifier', comment: '冲销记录表头ID' })
  reversalId: string;

  @ManyToOne(() => PurchaseReceiveNoticeReversal, (reversal) => reversal.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reversal_id' })
  reversal: PurchaseReceiveNoticeReversal;

  @Column({ name: 'line_no', type: 'int', comment: '行号' })
  lineNo: number;

  @Column({ name: 'source_notice_entry_id', length: 36, comment: '被冲销收料通知明细ID' })
  sourceNoticeEntryId: string;

  @Column({ name: 'source_order_entry_id', length: 36, comment: '来源采购订单明细ID' })
  sourceOrderEntryId: string;

  @Column({ name: 'material_id', length: 36, comment: '物料ID快照' })
  materialId: string;

  @Column({ name: 'unit_id', length: 36, comment: '计量单位ID快照' })
  unitId: string;

  @Column({ name: 'reversal_qty', type: 'decimal', precision: 18, scale: 4, comment: '冲销数量，存正数' })
  reversalQty: number;

  @Column({
    name: 'before_received_qty',
    type: 'decimal',
    precision: 18,
    scale: 4,
    comment: '订单明细冲销前累计收料数量',
  })
  beforeReceivedQty: number;

  @Column({
    name: 'after_received_qty',
    type: 'decimal',
    precision: 18,
    scale: 4,
    comment: '订单明细冲销后累计收料数量',
  })
  afterReceivedQty: number;
}
