import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_task')
export class SysTask extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'task_no', length: 50, comment: '任务编号' })
  taskNo: string;

  @Column({ name: 'title', length: 200, comment: '任务标题' })
  title: string;

  @Column({ type: 'text', nullable: true, comment: '任务描述' })
  description: string;

  @Column({ name: 'priority', type: 'int', default: 2, comment: '优先级: 1-高 2-中 3-低' })
  priority: number;

  @Column({ name: 'status', type: 'int', default: 1, comment: '状态: 1-待处理 2-进行中 3-已完成 4-已取消' })
  status: number;

  @Column({ name: 'progress', type: 'int', default: 0, comment: '进度(%)' })
  progress: number;

  @Column({ name: 'assignee_id', length: 36, comment: '负责人ID' })
  assigneeId: string;

  @Column({ name: 'assignee_name', length: 50, comment: '负责人姓名' })
  assigneeName: string;

  @Column({ name: 'creator_id', length: 36, comment: '创建人ID' })
  creatorId: string;

  @Column({ name: 'creator_name', length: 50, comment: '创建人姓名' })
  creatorName: string;

  @Column({ name: 'parent_id', length: 36, nullable: true, comment: '父任务ID' })
  parentId: string;

  @Column({ name: 'start_date', type: 'datetime', nullable: true, comment: '开始日期' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'datetime', nullable: true, comment: '截止日期' })
  endDate: Date;

  @Column({ name: 'completion_date', type: 'datetime', nullable: true, comment: '完成日期' })
  completionDate: Date;

  @Column({ name: 'business_type', length: 100, nullable: true, comment: '关联业务类型' })
  businessType: string;

  @Column({ name: 'business_id', length: 36, nullable: true, comment: '关联业务ID' })
  businessId: string;

  @Column({ name: 'tags', length: 500, nullable: true, comment: '标签(逗号分隔)' })
  tags: string;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}