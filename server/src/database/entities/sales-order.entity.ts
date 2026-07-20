import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('biz_sales_order')
export class SalesOrder extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'order_no', length: 50, comment: '订单编号' })
  orderNo: string;

  @Column({ name: 'customer_id', length: 36, comment: '客户ID' })
  customerId: string;

  @Column({ name: 'order_date', type: 'datetime', comment: '订单日期' })
  orderDate: Date;

  @Column({ name: 'delivery_date', type: 'datetime', nullable: true, comment: '交货日期' })
  deliveryDate: Date;

  @Column({ name: 'warehouse_id', length: 36, nullable: true, comment: '仓库ID' })
  warehouseId: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '总金额' })
  totalAmount: number;

  @Column({ name: 'total_tax', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '税额' })
  totalTax: number;

  @Column({ name: 'total_net_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '价税合计' })
  totalNetAmount: number;

  @Column({ name: 'currency_id', length: 36, nullable: true, comment: '币种ID' })
  currencyId: string;

  @Column({ name: 'payment_term_id', length: 36, nullable: true, comment: '付款条件ID' })
  paymentTermId: string;

  @Column({ name: 'salesperson_id', length: 36, nullable: true, comment: '销售员ID' })
  salespersonId: string;

  @Column({ name: 'source_id', length: 36, nullable: true, comment: '来源单据ID' })
  sourceId: string;

  @Column({ name: 'source_no', length: 50, nullable: true, comment: '来源单据号' })
  sourceNo: string;

  @Column({ name: 'customer_code', length: 50, nullable: true, comment: '客户编码' })
  customerCode: string;

  @Column({ name: 'customer_name', length: 200, nullable: true, comment: '客户名称' })
  customerName: string;

  @Column({ name: 'material_id', length: 36, nullable: true, comment: '物料ID' })
  materialId: string;

  @Column({ name: 'material_code', length: 50, nullable: true, comment: '物料编码' })
  materialCode: string;

  @Column({ name: 'material_name', length: 200, nullable: true, comment: '物料名称' })
  materialName: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true, comment: '数量' })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true, comment: '单价' })
  unitPrice: number;

  @Column({ type: 'int', default: 0, comment: '状态: 0-草稿 1-待审核 2-已审核 3-已出库 4-已关闭 5-已取消' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
