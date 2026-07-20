import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchaseOrderEntry } from './purchase-order-entry.entity';

@Entity('biz_purchase_order')
@Index('UQ_biz_purchase_order_push_idempotency_key', ['pushIdempotencyKey'], {
  unique: true,
  where: 'push_idempotency_key IS NOT NULL',
})
export class PurchaseOrder extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'order_no', length: 50, comment: '订单编号' })
  orderNo: string;

  @Column({ name: 'bill_type', length: 30, default: 'STANDARD_PURCHASE', comment: '单据类型' })
  billType: string;

  @Column({ name: 'business_type', length: 30, default: 'STANDARD', comment: '业务类型' })
  businessType: string;

  @Column({ name: 'supplier_id', length: 36, comment: '供应商ID/FSupplierId' })
  supplierId: string;

  @Column({ name: 'purchase_org_id', length: 36, comment: '采购组织ID/FPurchaseOrgId' })
  purchaseOrgId: string;

  @Column({ name: 'source_type', length: 30, default: 'MANUAL', comment: '来源类型：MANUAL/PURCHASE_REQUEST' })
  sourceType: string;

  @Column({ name: 'push_idempotency_key', length: 100, nullable: true, comment: '采购申请下推订单幂等键' })
  pushIdempotencyKey: string;

  @Column({ name: 'push_payload_hash', length: 64, nullable: true, comment: '采购申请下推订单规范化载荷SHA-256' })
  pushPayloadHash: string;

  @Column({ name: 'contract_no', length: 100, comment: '合同号/FContractNo；P0必填' })
  contractNo: string;

  @Column({ name: 'order_date', type: 'datetime', comment: '订单日期' })
  orderDate: Date;

  @Column({ name: 'delivery_date', type: 'datetime', nullable: true, comment: '默认交货日期' })
  deliveryDate: Date;

  @Column({ name: 'warehouse_id', length: 36, nullable: true, comment: '默认收料/入库仓库ID' })
  warehouseId: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '未税总金额' })
  totalAmount: number;

  @Column({ name: 'total_tax', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '税额' })
  totalTax: number;

  @Column({ name: 'total_net_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '价税合计' })
  totalNetAmount: number;

  @Column({ name: 'currency_id', length: 36, nullable: true, comment: '币种ID' })
  currencyId: string;

  @Column({ name: 'payment_term_id', length: 36, nullable: true, comment: '付款条件ID' })
  paymentTermId: string;

  @Column({ name: 'buyer_id', length: 36, nullable: true, comment: '采购员ID' })
  buyerId: string;

  @Column({ type: 'int', default: 0, comment: '状态: 0草稿 1待审核 2已审核 3已全部入库 4已关闭 5已取消 6已驳回' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @OneToMany(() => PurchaseOrderEntry, (entry) => entry.purchaseOrder, {
    cascade: false,
  })
  entries: PurchaseOrderEntry[];

  // 以下字段仅用于兼容历史单行数据和旧查询，新业务以 entries 为准。
  @Column({ name: 'source_id', length: 36, nullable: true, comment: '兼容字段：来源采购申请ID' })
  sourceId: string;

  @Column({ name: 'source_no', length: 50, nullable: true, comment: '兼容字段：来源采购申请单号' })
  sourceNo: string;

  @Column({ name: 'material_id', length: 36, nullable: true, comment: '兼容字段：首行物料ID' })
  materialId: string;

  @Column({ name: 'material_code', length: 50, nullable: true, comment: '兼容字段：首行物料编码' })
  materialCode: string;

  @Column({ name: 'material_name', length: 200, nullable: true, comment: '兼容字段：首行物料名称' })
  materialName: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true, comment: '兼容字段：首行数量' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 4, nullable: true, comment: '兼容字段：首行单价' })
  unitPrice: number;
}
