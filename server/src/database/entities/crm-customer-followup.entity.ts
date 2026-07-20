import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('crm_customer_followup')
export class CrmCustomerFollowup extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'followup_no', length: 50, comment: '跟进记录编号' })
  followupNo: string;

  @Column({ name: 'customer_id', length: 36, comment: '客户ID' })
  customerId: string;

  @Column({ name: 'customer_no', length: 50, comment: '客户编号' })
  customerNo: string;

  @Column({ name: 'customer_name', length: 200, comment: '客户名称' })
  customerName: string;

  @Column({ name: 'contact_id', length: 36, nullable: true, comment: '联系人ID' })
  contactId: string;

  @Column({ name: 'contact_name', length: 50, nullable: true, comment: '联系人姓名' })
  contactName: string;

  @Column({ name: 'followup_type', length: 50, comment: '跟进方式: phone-电话 email-邮件 visit-拜访 meeting-会议 wechat-微信' })
  followupType: string;

  @Column({ name: 'followup_result', length: 50, comment: '跟进结果: pending-待处理 progressing-进行中 success-成功 failed-失败' })
  followupResult: string;

  @Column({ type: 'text', comment: '跟进内容' })
  content: string;

  @Column({ name: 'next_followup_date', type: 'datetime', nullable: true, comment: '下次跟进日期' })
  nextFollowupDate: Date;

  @Column({ name: 'followup_user_id', length: 36, comment: '跟进人ID' })
  followupUserId: string;

  @Column({ name: 'followup_user_name', length: 50, comment: '跟进人姓名' })
  followupUserName: string;

  @Column({ type: 'int', default: 0, comment: '是否已回访: 1-是 0-否' })
  isReturned: number;
}