import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('svc_complaint')
export class SvcComplaint extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'complaint_no', length: 50, comment: '投诉编号' })
  complaintNo: string;

  @Column({ name: 'customer_id', length: 36, comment: '客户ID' })
  customerId: string;

  @Column({ name: 'contact_person', length: 50, nullable: true, comment: '联系人' })
  contactPerson: string;

  @Column({ name: 'contact_phone', length: 20, nullable: true, comment: '联系电话' })
  contactPhone: string;

  @Column({ name: 'complaint_type', type: 'int', comment: '投诉类型: 1-产品质量 2-服务态度 3-交货延迟 4-价格争议 5-其他' })
  complaintType: number;

  @Column({ type: 'int', default: 2, comment: '严重程度: 1-严重 2-一般 3-轻微' })
  severity: number;

  @Column({ length: 200, comment: '投诉标题' })
  title: string;

  @Column({ type: 'text', comment: '投诉内容' })
  content: string;

  @Column({ name: 'order_id', length: 36, nullable: true, comment: '关联订单ID' })
  orderId: string;

  @Column({ name: 'service_id', length: 36, nullable: true, comment: '关联服务单ID' })
  serviceId: string;

  @Column({ name: 'assignee_id', length: 36, nullable: true, comment: '处理人ID' })
  assigneeId: string;

  @Column({ type: 'text', nullable: true, comment: '处理方案' })
  solution: string;

  @Column({ name: 'compensation_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '赔偿金额' })
  compensationAmount: number;

  @Column({ type: 'int', default: 0, comment: '状态: 0-待处理 1-处理中 2-已解决 3-已关闭' })
  status: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}