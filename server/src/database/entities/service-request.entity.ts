import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('svc_service_request')
export class ServiceRequest extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'service_no', length: 50, comment: '服务单号' })
  serviceNo: string;

  @Index()
  @Column({ name: 'customer_id', length: 36, comment: '客户ID' })
  customerId: string;

  @Column({ name: 'contact_person', length: 50, nullable: true, comment: '联系人' })
  contactPerson: string;

  @Column({ name: 'contact_phone', length: 20, nullable: true, comment: '联系电话' })
  contactPhone: string;

  @Column({ name: 'service_type', type: 'int', comment: '服务类型: 1-维修 2-保养 3-安装 4-培训 5-退货 6-换货' })
  serviceType: number;

  @Column({ type: 'int', default: 2, comment: '优先级: 1-紧急 2-正常 3-低' })
  priority: number;

  @Column({ length: 200, comment: '标题' })
  title: string;

  @Column({ type: 'text', comment: '问题描述' })
  description: string;

  @Column({ name: 'product_id', length: 36, nullable: true, comment: '产品ID' })
  productId: string;

  @Column({ name: 'warranty_status', type: 'int', default: 0, comment: '保修状态: 0-保内 1-保外 2-未知' })
  warrantyStatus: number;

  @Column({ name: 'assignee_id', length: 36, nullable: true, comment: '处理人ID' })
  assigneeId: string;

  @Column({ name: 'request_date', type: 'datetime', comment: '申请日期' })
  requestDate: Date;

  @Column({ name: 'planned_date', type: 'datetime', nullable: true, comment: '计划完成日期' })
  plannedDate: Date;

  @Column({ name: 'completed_date', type: 'datetime', nullable: true, comment: '完成日期' })
  completedDate: Date;

  @Column({ type: 'int', default: 0, comment: '状态: 0-待派工 1-已派工 2-处理中 3-已完成 4-已关闭' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
