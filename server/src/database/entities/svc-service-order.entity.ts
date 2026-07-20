import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('svc_service_order')
export class SvcServiceOrder extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'order_no', length: 50, comment: '服务订单号' })
  orderNo: string;

  @Column({ name: 'service_id', length: 36, comment: '服务请求ID' })
  serviceId: string;

  @Column({ name: 'service_no', length: 50, comment: '服务单号' })
  serviceNo: string;

  @Column({ name: 'customer_id', length: 36, comment: '客户ID' })
  customerId: string;

  @Column({ name: 'contact_person', length: 50, nullable: true, comment: '联系人' })
  contactPerson: string;

  @Column({ name: 'contact_phone', length: 20, nullable: true, comment: '联系电话' })
  contactPhone: string;

  @Column({ name: 'product_id', length: 36, nullable: true, comment: '产品ID' })
  productId: string;

  @Column({ name: 'product_code', length: 50, nullable: true, comment: '产品编码' })
  productCode: string;

  @Column({ name: 'product_name', length: 200, nullable: true, comment: '产品名称' })
  productName: string;

  @Column({ name: 'service_type', type: 'int', comment: '服务类型: 1-维修 2-保养 3-安装 4-培训 5-退货 6-换货' })
  serviceType: number;

  @Column({ name: 'service_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '服务金额' })
  serviceAmount: number;

  @Column({ name: 'material_cost', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '材料成本' })
  materialCost: number;

  @Column({ name: 'labor_cost', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '人工成本' })
  laborCost: number;

  @Column({ name: 'technician_id', length: 36, nullable: true, comment: '技术员ID' })
  technicianId: string;

  @Column({ name: 'technician_name', length: 50, nullable: true, comment: '技术员名称' })
  technicianName: string;

  @Column({ name: 'service_date', type: 'datetime', nullable: true, comment: '服务日期' })
  serviceDate: Date;

  @Column({ type: 'text', nullable: true, comment: '服务记录' })
  serviceRecord: string;

  @Column({ type: 'text', nullable: true, comment: '客户反馈' })
  customerFeedback: string;

  @Column({ type: 'int', default: 0, comment: '状态: 0-待派工 1-已派工 2-已上门 3-服务中 4-已完成 5-已结算 6-已关闭' })
  status: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}