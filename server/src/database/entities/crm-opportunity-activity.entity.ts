import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('crm_opportunity_activity')
export class CrmOpportunityActivity extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'activity_no', length: 50, comment: '活动编号' })
  activityNo: string;

  @Column({ name: 'opportunity_id', length: 36, comment: '商机ID' })
  opportunityId: string;

  @Column({ name: 'opportunity_no', length: 50, comment: '商机编号' })
  opportunityNo: string;

  @Column({ name: 'activity_type', length: 50, comment: '活动类型: call-电话 meeting-会议 visit-拜访 email-邮件 quotation-报价' })
  activityType: string;

  @Column({ length: 200, comment: '活动主题' })
  title: string;

  @Column({ type: 'datetime', comment: '活动时间' })
  activityTime: Date;

  @Column({ type: 'text', comment: '活动内容' })
  content: string;

  @Column({ name: 'next_action', type: 'text', nullable: true, comment: '下一步行动' })
  nextAction: string;

  @Column({ name: 'next_action_time', type: 'datetime', nullable: true, comment: '下一步行动时间' })
  nextActionTime: Date;

  @Column({ name: 'activity_user_id', length: 36, comment: '活动人ID' })
  activityUserId: string;

  @Column({ name: 'activity_user_name', length: 50, comment: '活动人姓名' })
  activityUserName: string;
}