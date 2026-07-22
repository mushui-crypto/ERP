import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchaseOrderChange } from './purchase-order-change.entity';

@Entity('biz_purchase_order_change_entry')
@Index('UQ_purchase_order_change_entry_line', ['purchaseOrderChangeId', 'lineNo'], { unique: true })
@Index('IDX_purchase_order_change_entry_order', ['sourceOrderEntryId'])
export class PurchaseOrderChangeEntry extends BaseEntity {
  @Column({ name: 'purchase_order_change_id', type: 'uniqueidentifier' })
  purchaseOrderChangeId: string;

  @ManyToOne(() => PurchaseOrderChange, (change) => change.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_order_change_id' })
  purchaseOrderChange: PurchaseOrderChange;

  @Column({ name: 'line_no', type: 'int' })
  lineNo: number;

  @Column({ name: 'source_order_id', length: 36 }) sourceOrderId: string;
  @Column({ name: 'source_order_no', type: 'nvarchar', length: 50 }) sourceOrderNo: string;
  @Column({ name: 'source_order_entry_id', length: 36 }) sourceOrderEntryId: string;
  @Column({ name: 'source_request_id', length: 36, nullable: true }) sourceRequestId: string;
  @Column({ name: 'source_request_entry_id', length: 36, nullable: true }) sourceRequestEntryId: string;
  @Column({ name: 'expense_item_code', length: 50, nullable: true }) expenseItemCode: string;
  @Column({ name: 'expense_item_name', type: 'nvarchar', length: 200, nullable: true }) expenseItemName: string;
  @Column({ name: 'material_id', length: 36, nullable: true }) materialId: string;
  @Column({ name: 'material_code', length: 50, nullable: true }) materialCode: string;
  @Column({ name: 'material_name', type: 'nvarchar', length: 200, nullable: true }) materialName: string;
  @Column({ name: 'material_model', type: 'nvarchar', length: 200, nullable: true }) materialModel: string;
  @Column({ name: 'unit_id', length: 36, nullable: true }) unitId: string;
  @Column({ name: 'unit_code', length: 50, nullable: true }) unitCode: string;
  @Column({ name: 'unit_name', type: 'nvarchar', length: 50, nullable: true }) unitName: string;
  @Column({ name: 'snapshot_received_qty', type: 'decimal', precision: 18, scale: 4, default: 0 }) snapshotReceivedQty: number;
  @Column({ name: 'snapshot_stocked_qty', type: 'decimal', precision: 18, scale: 4, default: 0 }) snapshotStockedQty: number;
  @Column({ name: 'snapshot_returned_qty', type: 'decimal', precision: 18, scale: 4, default: 0 }) snapshotReturnedQty: number;
  @Column({ name: 'old_order_qty', type: 'decimal', precision: 18, scale: 4 }) oldOrderQty: number;
  @Column({ name: 'new_order_qty', type: 'decimal', precision: 18, scale: 4 }) newOrderQty: number;
  @Column({ name: 'old_unit_price', type: 'decimal', precision: 18, scale: 4 }) oldUnitPrice: number;
  @Column({ name: 'new_unit_price', type: 'decimal', precision: 18, scale: 4 }) newUnitPrice: number;
  @Column({ name: 'tax_rate', type: 'decimal', precision: 9, scale: 4, default: 0 }) taxRate: number;
  @Column({ name: 'old_delivery_date', type: 'datetime', nullable: true }) oldDeliveryDate: Date;
  @Column({ name: 'new_delivery_date', type: 'datetime', nullable: true }) newDeliveryDate: Date;
  @Column({ name: 'old_warehouse_id', length: 36, nullable: true }) oldWarehouseId: string;
  @Column({ name: 'new_warehouse_id', length: 36, nullable: true }) newWarehouseId: string;
  @Column({ name: 'old_remark', type: 'nvarchar', length: 500, nullable: true }) oldRemark: string;
  @Column({ name: 'new_remark', type: 'nvarchar', length: 500, nullable: true }) newRemark: string;
  @Column({ name: 'change_type', type: 'nvarchar', length: 200 }) changeType: string;
}
