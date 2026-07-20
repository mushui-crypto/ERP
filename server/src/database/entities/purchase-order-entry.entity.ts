import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchaseOrder } from './purchase-order.entity';

@Entity('biz_purchase_order_entry')
@Index(['purchaseOrderId', 'lineNo'], { unique: true })
@Index(['sourceRequestEntryId'])
export class PurchaseOrderEntry extends BaseEntity {
  @Column({ name: 'purchase_order_id', type: 'uniqueidentifier', comment: '采购订单表头ID' })
  purchaseOrderId: string;

  @ManyToOne(() => PurchaseOrder, (order) => order.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_order_id' })
  purchaseOrder: PurchaseOrder;

  @Column({ name: 'line_no', type: 'int', comment: '行号' })
  lineNo: number;

  @Column({ name: 'supplier_id', length: 36, comment: '实际供应商ID' })
  supplierId: string;

  @Column({ name: 'material_id', length: 36, comment: '物料ID/FMaterialId' })
  materialId: string;

  @Column({ name: 'material_code', length: 50, comment: '物料编码' })
  materialCode: string;

  @Column({ name: 'material_name', length: 200, comment: '物料名称/FMaterialName' })
  materialName: string;

  @Column({ name: 'material_model', length: 200, nullable: true, comment: '规格型号' })
  materialModel: string;

  @Column({ name: 'unit_id', length: 36, comment: '采购单位ID/FUnitId' })
  unitId: string;

  @Column({ name: 'unit_code', length: 50, nullable: true, comment: '采购单位编码' })
  unitCode: string;

  @Column({ name: 'unit_name', length: 50, nullable: true, comment: '采购单位名称' })
  unitName: string;

  @Column({ name: 'order_qty', type: 'decimal', precision: 18, scale: 4, comment: '采购数量/FQty' })
  orderQty: number;

  @Column({ name: 'received_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '累计审核收料数量/FReceiveQty' })
  receivedQty: number;

  @Column({ name: 'stocked_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '累计审核入库数量/FStockInQty' })
  stockedQty: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '采购单价' })
  unitPrice: number;

  @Column({ name: 'amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '未税金额' })
  amount: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 9, scale: 4, default: 0, comment: '税率' })
  taxRate: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '税额' })
  taxAmount: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '价税合计' })
  netAmount: number;

  @Column({ name: 'delivery_date', type: 'datetime', nullable: true, comment: '交货日期/FDeliveryDate' })
  deliveryDate: Date;

  @Column({ name: 'warehouse_id', length: 36, nullable: true, comment: '收料/入库仓库ID' })
  warehouseId: string;

  @Column({ name: 'check_incoming', default: true, comment: '是否来料检验，供收料明细默认值使用' })
  checkIncoming: boolean;

  @Column({ name: 'source_request_id', length: 36, nullable: true, comment: '来源采购申请表头ID' })
  sourceRequestId: string;

  @Column({ name: 'source_request_no', length: 50, nullable: true, comment: '来源采购申请单号' })
  sourceRequestNo: string;

  @Column({ name: 'source_request_entry_id', length: 36, nullable: true, comment: '来源采购申请明细ID' })
  sourceRequestEntryId: string;

  @Column({ length: 500, nullable: true, comment: '行备注' })
  remark: string;
}
