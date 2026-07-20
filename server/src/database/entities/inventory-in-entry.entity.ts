import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { InventoryIn } from './inventory-in.entity';

@Entity('inventory_in_entry')
@Index('UQ_inventory_in_entry_header_line', ['inventoryInId', 'lineNo'], { unique: true })
@Index('IDX_inventory_in_entry_receive_entry', ['sourceReceiveNoticeEntryId'])
@Index('IDX_inventory_in_entry_order_entry', ['sourceOrderEntryId'])
export class InventoryInEntry extends BaseEntity {
  @Column({ name: 'inventory_in_id', type: 'uniqueidentifier', comment: '采购入库表头ID' })
  inventoryInId: string;

  @ManyToOne(() => InventoryIn, (inventoryIn) => inventoryIn.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventory_in_id' })
  inventoryIn: InventoryIn;

  @Column({ name: 'line_no', type: 'int', comment: '行号' })
  lineNo: number;

  @Column({ name: 'warehouse_id', length: 36, comment: '仓库ID/FStockId' })
  warehouseId: string;

  @Column({ name: 'warehouse_code', length: 50, nullable: true, comment: '仓库编码快照' })
  warehouseCode: string;

  @Column({ name: 'warehouse_name', length: 200, nullable: true, comment: '仓库名称快照' })
  warehouseName: string;

  @Column({ name: 'material_id', length: 36, comment: '物料ID/FMaterialId' })
  materialId: string;

  @Column({ name: 'material_code', length: 50, comment: '物料编码快照' })
  materialCode: string;

  @Column({ name: 'material_name', length: 200, comment: '物料名称快照' })
  materialName: string;

  @Column({ name: 'material_model', length: 200, nullable: true, comment: '规格型号快照' })
  materialModel: string;

  @Column({ name: 'unit_id', length: 36, comment: '计量单位ID/FUnitId' })
  unitId: string;

  @Column({ name: 'unit_code', length: 50, nullable: true, comment: '计量单位编码快照' })
  unitCode: string;

  @Column({ name: 'unit_name', length: 50, nullable: true, comment: '计量单位名称快照' })
  unitName: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, comment: '本次入库数量/FRealQty' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 4, comment: '来源采购订单单价，不允许入库环节修改' })
  unitPrice: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 9, scale: 4, default: 0, comment: '来源采购订单税率' })
  taxRate: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, comment: '未税金额，按明细舍入' })
  amount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '税额，按明细舍入' })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '价税合计，按明细舍入' })
  totalAmount: number;

  @Column({ name: 'lot_no', length: 100, nullable: true, comment: '批号/供应商批号' })
  lotNo: string;

  @Column({ name: 'produce_date', type: 'datetime', nullable: true, comment: '生产日期' })
  produceDate: Date;

  @Column({ name: 'expiry_date', type: 'datetime', nullable: true, comment: '有效期至' })
  expiryDate: Date;

  @Column({ length: 100, nullable: true, comment: '库位' })
  location: string;

  @Column({ name: 'source_receive_notice_id', length: 36, comment: '来源收料通知表头ID' })
  sourceReceiveNoticeId: string;

  @Column({ name: 'source_receive_notice_no', length: 50, comment: '来源收料通知单号' })
  sourceReceiveNoticeNo: string;

  @Column({ name: 'source_receive_notice_entry_id', length: 36, comment: '来源收料通知明细ID' })
  sourceReceiveNoticeEntryId: string;

  @Column({ name: 'source_order_id', length: 36, comment: '来源采购订单表头ID' })
  sourceOrderId: string;

  @Column({ name: 'source_order_no', length: 50, comment: '来源采购订单单号' })
  sourceOrderNo: string;

  @Column({ name: 'source_order_entry_id', length: 36, comment: '来源采购订单明细ID' })
  sourceOrderEntryId: string;

  @Column({ name: 'source_request_id', length: 36, nullable: true, comment: '来源采购申请表头ID' })
  sourceRequestId: string;

  @Column({ name: 'source_request_no', length: 50, nullable: true, comment: '来源采购申请单号' })
  sourceRequestNo: string;

  @Column({ name: 'source_request_entry_id', length: 36, nullable: true, comment: '来源采购申请明细ID' })
  sourceRequestEntryId: string;

  @Column({ name: 'inventory_posting_id', length: 36, nullable: true, comment: '库存过账记录ID' })
  inventoryPostingId: string;

  @Column({ length: 500, nullable: true, comment: '行备注' })
  remark: string;
}
