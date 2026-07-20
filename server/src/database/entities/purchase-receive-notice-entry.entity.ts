import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchaseReceiveNotice } from './purchase-receive-notice.entity';

@Entity('biz_purchase_receive_notice_entry')
@Index(['purchaseReceiveNoticeId', 'lineNo'], { unique: true })
@Index(['sourceOrderEntryId'])
@Index(['sourceRequestEntryId'])
export class PurchaseReceiveNoticeEntry extends BaseEntity {
  @Column({ name: 'purchase_receive_notice_id', type: 'uniqueidentifier', comment: '收料通知表头ID' })
  purchaseReceiveNoticeId: string;

  @ManyToOne(() => PurchaseReceiveNotice, (notice) => notice.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_receive_notice_id' })
  purchaseReceiveNotice: PurchaseReceiveNotice;

  @Column({ name: 'line_no', type: 'int', comment: '行号' })
  lineNo: number;

  @Column({ name: 'source_order_id', length: 36, comment: '来源采购订单表头ID/FSrcId' })
  sourceOrderId: string;

  @Column({ name: 'source_order_no', length: 50, comment: '来源采购订单单号/FSrcBillNo' })
  sourceOrderNo: string;

  @Column({ name: 'source_order_entry_id', length: 36, comment: '来源采购订单明细ID/FSrcEntryId/FPOORDERENTRYID' })
  sourceOrderEntryId: string;

  @Column({ name: 'source_request_id', length: 36, nullable: true, comment: '来源采购申请表头ID' })
  sourceRequestId: string;

  @Column({ name: 'source_request_no', length: 50, nullable: true, comment: '来源采购申请单号' })
  sourceRequestNo: string;

  @Column({ name: 'source_request_entry_id', length: 36, nullable: true, comment: '来源采购申请明细ID' })
  sourceRequestEntryId: string;

  @Column({ name: 'material_id', length: 36, comment: '物料ID/FMaterialId' })
  materialId: string;

  @Column({ name: 'material_code', length: 50, comment: '物料编码' })
  materialCode: string;

  @Column({ name: 'material_name', length: 200, comment: '物料名称/FMaterialName' })
  materialName: string;

  @Column({ name: 'material_model', length: 200, nullable: true, comment: '规格型号/FMateriaModel' })
  materialModel: string;

  @Column({ name: 'unit_id', length: 36, comment: '收料单位/FUnitId' })
  unitId: string;

  @Column({ name: 'unit_code', length: 50, nullable: true, comment: '收料单位编码' })
  unitCode: string;

  @Column({ name: 'unit_name', length: 50, nullable: true, comment: '收料单位名称' })
  unitName: string;

  @Column({ name: 'receive_qty', type: 'decimal', precision: 18, scale: 4, comment: '本次实收数量/FActReceiveQty' })
  receiveQty: number;

  @Column({ name: 'inspected_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '累计已检数量' })
  inspectedQty: number;

  @Column({ name: 'qualified_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '累计合格数量' })
  qualifiedQty: number;

  @Column({ name: 'concession_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '累计让步接收数量/FCsnReceiveQty' })
  concessionQty: number;

  @Column({ name: 'unqualified_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '累计不合格数量/FRefuseJoinQty' })
  unqualifiedQty: number;

  @Column({ name: 'stocked_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '累计审核入库数量/FInStockQty' })
  stockedQty: number;

  @Column({ name: 'check_incoming', default: true, comment: '明细是否来料检验/FCheckInComing' })
  checkIncoming: boolean;

  @Column({ name: 'warehouse_id', length: 36, nullable: true, comment: '仓库/FStockID' })
  warehouseId: string;

  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '来源订单单价/FPrice' })
  unitPrice: number;

  @Column({ name: 'amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '未税金额/FAmount' })
  amount: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 9, scale: 4, default: 0, comment: '税率/FEntryTaxRate' })
  taxRate: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '税额/FEntryTaxAmount' })
  taxAmount: number;

  @Column({ name: 'net_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '价税合计/FAllAmount' })
  netAmount: number;

  @Column({ name: 'supplier_lot', length: 100, nullable: true, comment: '供应商批号/FSupplierLot' })
  supplierLot: string;

  @Column({ name: 'produce_date', type: 'datetime', nullable: true, comment: '生产日期/FProduceDate' })
  produceDate: Date;

  @Column({ name: 'expiry_date', type: 'datetime', nullable: true, comment: '有效期至/FExpiryDate' })
  expiryDate: Date;

  @Column({ length: 500, nullable: true, comment: '行备注/FDescription' })
  remark: string;
}
