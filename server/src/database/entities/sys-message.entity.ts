import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_message')
export class SysMessage extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'message_no', length: 50, comment: '消息编号' })
  messageNo: string;

  @Column({ name: 'sender_id', length: 36, comment: '发送人ID' })
  senderId: string;

  @Column({ name: 'sender_name', length: 50, comment: '发送人姓名' })
  senderName: string;

  @Column({ name: 'receiver_id', length: 36, comment: '接收人ID' })
  receiverId: string;

  @Column({ name: 'receiver_name', length: 50, comment: '接收人姓名' })
  receiverName: string;

  @Column({ name: 'message_type', length: 50, comment: '消息类型: system-系统通知 task-任务提醒 approval-审批提醒 notification-普通通知' })
  messageType: string;

  @Column({ name: 'title', length: 200, comment: '消息标题' })
  title: string;

  @Column({ type: 'text', comment: '消息内容' })
  content: string;

  @Column({ name: 'business_type', length: 100, nullable: true, comment: '业务类型' })
  businessType: string;

  @Column({ name: 'business_id', length: 36, nullable: true, comment: '业务数据ID' })
  businessId: string;

  @Column({ name: 'business_no', length: 50, nullable: true, comment: '业务单据编号' })
  businessNo: string;

  @Column({ name: 'link_url', length: 500, nullable: true, comment: '跳转链接' })
  linkUrl: string;

  @Column({ type: 'int', default: 0, comment: '是否已读: 1-已读 0-未读' })
  isRead: number;

  @Column({ name: 'read_time', type: 'datetime', nullable: true, comment: '阅读时间' })
  readTime: Date;

  @Column({ name: 'is_pinned', type: 'int', default: 0, comment: '是否置顶: 1-是 0-否' })
  isPinned: number;

  @Column({ name: 'priority', type: 'int', default: 2, comment: '优先级: 1-高 2-中 3-低' })
  priority: number;
}