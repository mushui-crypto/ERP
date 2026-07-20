import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { InventoryInEntry } from './inventory-in-entry.entity';

@Entity('inventory_in')
@Index('UQ_inventory_in_push_idempotency_key', ['pushIdempotencyKey'], {
  unique: true,
  where: 'push_idempotency_key IS NOT NULL',
})
export class InventoryIn extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'in_no', length: 50, comment: '入库单号/FBillNo' })
  inNo: string;

  @Column({ name: 'push_idempotency_key', length: 100, nullable: true, comment: '收料下推采购入库幂等键' })
  pushIdempotencyKey: string;

  @Column({ name: 'push_payload_hash', length: 64, nullable: true, comment: '幂等请求载荷摘要' })
  pushPayloadHash: string;

  @Column({ name: 'org_id', length: 36, comment: '兼容字段：组织ID；采购入库等同收料组织' })
  orgId: string;

  @Column({ name: 'stock_org_id', length: 36, nullable: true, comment: '收料/库存组织/FStockOrgId' })
  stockOrgId: string;

  @Column({ name: 'purchase_org_id', length: 36, nullable: true, comment: '采购组织/FPurchaseOrgId' })
  purchaseOrgId: string;

  @Column({ name: 'settle_org_id', length: 36, nullable: true, comment: '结算组织/FSettleOrgId' })
  settleOrgId: string;

  @Column({ name: 'owner_type', length: 50, nullable: true, comment: '货主类型/FOwnerTypeIdHead' })
  ownerType: string;

  @Column({ name: 'owner_id', length: 36, nullable: true, comment: '货主/FOwnerIdHead' })
  ownerId: string;

  @Column({ name: 'business_type', length: 50, nullable: true, comment: '业务类型/FBusinessType；当前标准采购固定 STANDARD' })
  businessType: string;

  @Column({ name: 'warehouse_id', length: 36, nullable: true, comment: '兼容字段：首行仓库ID' })
  warehouseId: string;

  @Column({ name: 'warehouse_code', length: 50, nullable: true, comment: '兼容字段：首行仓库编码' })
  warehouseCode: string;

  @Column({ name: 'warehouse_name', length: 200, nullable: true, comment: '兼容字段：首行仓库名称' })
  warehouseName: string;

  @Column({ name: 'in_type', type: 'int', comment: '入库类型: 1-采购入库 2-生产入库 3-销售退货入库 4-其他入库' })
  inType: number;

  @Column({ name: 'source_type', length: 50, nullable: true, comment: '来源类型；采购入库为 PURCHASE_RECEIVE_NOTICE' })
  sourceType: string;

  @Column({ name: 'source_id', length: 36, nullable: true, comment: '兼容字段：单一来源收料通知ID；多来源时为空' })
  sourceId: string;

  @Column({ name: 'source_no', length: 50, nullable: true, comment: '兼容字段：单一来源收料通知单号；多来源时为空' })
  sourceNo: string;

  @Column({ name: 'supplier_id', length: 36, nullable: true, comment: '供应商ID/FSupplierId' })
  supplierId: string;

  @Column({ name: 'supplier_code', length: 50, nullable: true, comment: '供应商编码快照' })
  supplierCode: string;

  @Column({ name: 'supplier_name', length: 200, nullable: true, comment: '供应商名称快照' })
  supplierName: string;

  @Column({ name: 'currency_id', length: 36, nullable: true, comment: '结算币别/FSettleCurrId' })
  currencyId: string;

  @Column({ name: 'payment_term_id', length: 36, nullable: true, comment: '付款条件/FPayConditionId' })
  paymentTermId: string;

  @Column({ name: 'material_id', length: 36, nullable: true, comment: '兼容字段：首行物料ID' })
  materialId: string;

  @Column({ name: 'material_code', length: 50, nullable: true, comment: '兼容字段：首行物料编码' })
  materialCode: string;

  @Column({ name: 'material_name', length: 200, nullable: true, comment: '兼容字段：首行物料名称' })
  materialName: string;

  @Column({ name: 'spec', length: 200, nullable: true, comment: '兼容字段：首行规格型号' })
  spec: string;

  @Column({ name: 'unit_id', length: 36, nullable: true, comment: '兼容字段：首行计量单位ID' })
  unitId: string;

  @Column({ name: 'unit_code', length: 50, nullable: true, comment: '兼容字段：首行计量单位编码' })
  unitCode: string;

  @Column({ name: 'unit_name', length: 50, nullable: true, comment: '兼容字段：首行计量单位名称' })
  unitName: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true, comment: '兼容字段：首行入库数量' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 4, nullable: true, comment: '兼容字段：首行单价' })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, comment: '未税金额/FBillAmount' })
  amount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '税额/FBillTaxAmount' })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '价税合计/FBillAllAmount' })
  totalAmount: number;

  @Column({ name: 'lot_no', length: 50, nullable: true, comment: '兼容字段：首行批号' })
  lotNo: string;

  @Column({ name: 'expire_date', type: 'datetime', nullable: true, comment: '兼容字段：首行有效期' })
  expireDate: Date;

  @Column({ name: 'location', length: 100, nullable: true, comment: '兼容字段：首行库位' })
  location: string;

  @Column({ name: 'in_date', type: 'datetime', comment: '入库日期/FDate' })
  inDate: Date;

  @Column({ type: 'int', default: 0, comment: '状态: 0草稿 1待审核 2已审核 3已取消 4已驳回' })
  status: number;

  @Column({ name: 'approved_at', type: 'datetime', nullable: true, comment: '审核时间/FApproveDate' })
  approvedAt: Date;

  @Column({ name: 'approved_by', length: 50, nullable: true, comment: '审核人/FApproverId' })
  approvedBy: string;

  @Column({ name: 'payable_generation_status', length: 30, default: 'NOT_GENERATED', comment: '暂估应付生成状态' })
  payableGenerationStatus: string;

  @Column({ name: 'payable_id', length: 36, nullable: true, comment: '暂估应付ID' })
  payableId: string;

  @Column({ name: 'payable_no', length: 50, nullable: true, comment: '暂估应付单号' })
  payableNo: string;

  @Column({ name: 'payable_generation_error', length: 1000, nullable: true, comment: '暂估应付最近生成失败原因' })
  payableGenerationError: string;

  @Column({ name: 'payable_generation_failed_at', type: 'datetime', nullable: true, comment: '暂估应付最近生成失败时间' })
  payableGenerationFailedAt: Date;

  @Column({ name: 'payable_generated_at', type: 'datetime', nullable: true, comment: '暂估应付成功生成时间' })
  payableGeneratedAt: Date;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;

  @OneToMany(() => InventoryInEntry, (entry) => entry.inventoryIn, { cascade: false })
  entries: InventoryInEntry[];
}
