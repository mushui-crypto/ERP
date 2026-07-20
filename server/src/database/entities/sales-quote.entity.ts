import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sales_quote')
export class SalesQuote extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'quote_no', length: 50, comment: '报价单号' })
  quoteNo: string;

  @Column({ name: 'org_id', length: 36, comment: '组织ID' })
  orgId: string;

  @Column({ name: 'customer_id', length: 36, comment: '客户ID' })
  customerId: string;

  @Column({ name: 'customer_code', length: 50, comment: '客户编码' })
  customerCode: string;

  @Column({ name: 'customer_name', length: 200, comment: '客户名称' })
  customerName: string;

  @Column({ name: 'material_id', length: 36, comment: '物料ID' })
  materialId: string;

  @Column({ name: 'material_code', length: 50, comment: '物料编码' })
  materialCode: string;

  @Column({ name: 'material_name', length: 200, comment: '物料名称' })
  materialName: string;

  @Column({ name: 'unit_id', length: 36, comment: '计量单位ID' })
  unitId: string;

  @Column({ name: 'unit_code', length: 50, comment: '计量单位编码' })
  unitCode: string;

  @Column({ name: 'unit_name', length: 50, comment: '计量单位名称' })
  unitName: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, comment: '报价数量' })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, comment: '单价' })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, comment: '金额' })
  amount: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, comment: '税率(%)' })
  taxRate: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, comment: '税额' })
  taxAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, comment: '含税金额' })
  totalAmount: number;

  @Column({ name: 'quote_date', type: 'datetime', comment: '报价日期' })
  quoteDate: Date;

  @Column({ name: 'valid_date', type: 'datetime', comment: '有效期至' })
  validDate: Date;

  @Column({ name: 'delivery_period', length: 50, nullable: true, comment: '交货周期' })
  deliveryPeriod: string;

  @Column({ name: 'payment_term_id', length: 36, nullable: true, comment: '付款条件ID' })
  paymentTermId: string;

  @Column({ name: 'payment_term_name', length: 100, nullable: true, comment: '付款条件名称' })
  paymentTermName: string;

  @Column({ type: 'int', default: 0, comment: '状态: 0-草稿 1-待审核 2-已批准 3-已转订单 4-已失效 5-已取消' })
  status: number;

  @Column({ name: 'sales_order_id', length: 36, nullable: true, comment: '关联销售订单ID' })
  salesOrderId: string;

  @Column({ name: 'sales_order_no', length: 50, nullable: true, comment: '关联销售订单号' })
  salesOrderNo: string;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}