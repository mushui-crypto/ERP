import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('master_customer')
export class Customer extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'customer_code', length: 50, comment: '客户编码' })
  customerCode: string;

  @Column({ name: 'customer_name', length: 200, comment: '客户名称' })
  customerName: string;

  @Column({ name: 'short_name', length: 100, nullable: true, comment: '简称' })
  shortName: string;

  @Column({ name: 'customer_type', type: 'int', default: 1, comment: '客户类型: 1-企业 2-个人' })
  customerType: number;

  @Column({ name: 'industry', length: 50, nullable: true, comment: '所属行业' })
  industry: string;

  @Column({ name: 'contact_person', length: 50, nullable: true, comment: '联系人' })
  contactPerson: string;

  @Column({ name: 'contact_phone', length: 20, nullable: true, comment: '联系电话' })
  contactPhone: string;

  @Column({ name: 'email', length: 100, nullable: true, comment: '邮箱' })
  email: string;

  @Column({ name: 'address', length: 500, nullable: true, comment: '地址' })
  address: string;

  @Column({ name: 'credit_limit', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '信用额度' })
  creditLimit: number;

  @Column({ name: 'credit_period', type: 'int', default: 30, comment: '信用期(天)' })
  creditPeriod: number;

  @Column({ name: 'payment_term_id', length: 36, nullable: true, comment: '付款条件ID' })
  paymentTermId: string;

  @Column({ name: 'salesperson_id', length: 36, nullable: true, comment: '销售员ID' })
  salespersonId: string;

  @Column({ name: 'tax_number', length: 50, nullable: true, comment: '税号' })
  taxNumber: string;

  @Column({ name: 'bank_name', length: 100, nullable: true, comment: '开户银行' })
  bankName: string;

  @Column({ name: 'bank_account', length: 50, nullable: true, comment: '银行账号' })
  bankAccount: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
