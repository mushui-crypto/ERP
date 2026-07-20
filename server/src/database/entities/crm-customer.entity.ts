import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('crm_customer')
export class CrmCustomer extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'customer_no', length: 50, comment: '客户编号' })
  customerNo: string;

  @Column({ name: 'category_id', length: 36, nullable: true, comment: '分类ID' })
  categoryId: string;

  @Column({ name: 'customer_name', length: 200, comment: '客户名称' })
  customerName: string;

  @Column({ name: 'contact_person', length: 50, nullable: true, comment: '联系人' })
  contactPerson: string;

  @Column({ name: 'contact_phone', length: 20, nullable: true, comment: '联系电话' })
  contactPhone: string;

  @Column({ length: 100, nullable: true, comment: '邮箱' })
  email: string;

  @Column({ type: 'int', default: 1, comment: '客户来源: 1-线上 2-线下 3-转介绍 4-展会' })
  source: number;

  @Column({ type: 'int', default: 3, comment: '客户等级: 1-VIP 2-重要 3-普通 4-潜在' })
  level: number;

  @Column({ length: 50, nullable: true, comment: '行业' })
  industry: string;

  @Column({ length: 500, nullable: true, comment: '地址' })
  address: string;

  @Column({ name: 'salesperson_id', length: 36, nullable: true, comment: '销售员ID' })
  salespersonId: string;

  @Column({ name: 'last_contact_date', type: 'datetime', nullable: true, comment: '最后联系日期' })
  lastContactDate: Date;

  @Column({ name: 'next_contact_date', type: 'datetime', nullable: true, comment: '下次联系日期' })
  nextContactDate: Date;

  @Column({ type: 'int', default: 1, comment: '状态: 1-活跃 2-沉默 3-流失' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
