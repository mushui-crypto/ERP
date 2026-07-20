import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchaseReturnRequest } from './purchase-return-request.entity';

@Entity('biz_purchase_return_request_entry')
@Index('UQ_purchase_return_request_entry_line', ['purchaseReturnRequestId', 'lineNo'], { unique: true })
@Index('IDX_purchase_return_request_entry_inbound', ['sourceInventoryInEntryId'])
export class PurchaseReturnRequestEntry extends BaseEntity {
  @Column({ name: 'purchase_return_request_id', type: 'uniqueidentifier', comment: '退料申请表头ID' })
  purchaseReturnRequestId: string;

  @ManyToOne(() => PurchaseReturnRequest, (request) => request.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_return_request_id' })
  purchaseReturnRequest: PurchaseReturnRequest;

  @Column({ name: 'line_no', type: 'int', comment: '行号' })
  lineNo: number;

  @Column({ name: 'source_inventory_in_id', length: 36, comment: '来源采购入库表头ID' })
  sourceInventoryInId: string;

  @Column({ name: 'source_inventory_in_no', length: 50, comment: '来源采购入库单号' })
  sourceInventoryInNo: string;

  @Column({ name: 'source_inventory_in_entry_id', length: 36, comment: '来源采购入库明细ID' })
  sourceInventoryInEntryId: string;

  @Column({ name: 'source_receive_notice_id', length: 36, comment: '来源收料通知ID' })
  sourceReceiveNoticeId: string;

  @Column({ name: 'source_receive_notice_entry_id', length: 36, comment: '来源收料通知明细ID' })
  sourceReceiveNoticeEntryId: string;

  @Column({ name: 'source_order_id', length: 36, comment: '来源采购订单ID' })
  sourceOrderId: string;

  @Column({ name: 'source_order_entry_id', length: 36, comment: '来源采购订单明细ID' })
  sourceOrderEntryId: string;

  @Column({ name: 'source_request_id', length: 36, nullable: true, comment: '来源采购申请ID' })
  sourceRequestId: string;

  @Column({ name: 'source_request_entry_id', length: 36, nullable: true, comment: '来源采购申请明细ID' })
  sourceRequestEntryId: string;

  @Column({ name: 'material_id', length: 36, comment: '物料ID快照' })
  materialId: string;

  @Column({ name: 'material_code', length: 50, comment: '物料编码快照' })
  materialCode: string;

  @Column({ name: 'material_name', length: 200, comment: '物料名称快照' })
  materialName: string;

  @Column({ name: 'material_model', length: 200, nullable: true, comment: '规格型号快照' })
  materialModel: string;

  @Column({ name: 'unit_id', length: 36, comment: '单位ID快照' })
  unitId: string;

  @Column({ name: 'unit_code', length: 50, nullable: true, comment: '单位编码快照' })
  unitCode: string;

  @Column({ name: 'unit_name', length: 50, nullable: true, comment: '单位名称快照' })
  unitName: string;

  @Column({ name: 'warehouse_id', length: 36, comment: '退料仓库' })
  warehouseId: string;

  @Column({ name: 'lot_no', length: 100, default: '', comment: '批号' })
  lotNo: string;

  @Column({ name: 'request_qty', type: 'decimal', precision: 18, scale: 4, comment: '申请退料数量' })
  requestQty: number;

  @Column({ name: 'returned_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '已审核退料数量' })
  returnedQty: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 4, comment: '来源采购价格' })
  unitPrice: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 9, scale: 4, default: 0, comment: '税率' })
  taxRate: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, comment: '未税金额' })
  amount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '税额' })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '价税合计' })
  totalAmount: number;

  @Column({ length: 500, nullable: true, comment: '行备注' })
  remark: string;
}
