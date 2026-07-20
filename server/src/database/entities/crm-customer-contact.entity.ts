import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('crm_customer_contact')
export class CrmCustomerContact extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'contact_no', length: 50, comment: '联系人编号' })
  contactNo: string;

  @Column({ name: 'customer_id', length: 36, comment: '客户ID' })
  customerId: string;

  @Column({ name: 'customer_no', length: 50, comment: '客户编号' })
  customerNo: string;

  @Column({ name: 'customer_name', length: 200, comment: '客户名称' })
  customerName: string;

  @Column({ length: 50, comment: '姓名' })
  name: string;

  @Column({ name: 'position', length: 100, nullable: true, comment: '职位' })
  position: string;

  @Column({ name: 'phone', length: 20, comment: '手机号码' })
  phone: string;

  @Column({ name: 'email', length: 100, nullable: true, comment: '邮箱' })
  email: string;

  @Column({ name: 'qq', length: 20, nullable: true, comment: 'QQ' })
  qq: string;

  @Column({ name: 'wechat', length: 100, nullable: true, comment: '微信' })
  wechat: string;

  @Column({ type: 'int', default: 0, comment: '是否主联系人: 1-是 0-否' })
  isPrimary: number;

  @Column({ type: 'int', default: 1, comment: '是否启用: 1-启用 0-禁用' })
  enabled: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}