import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_task_comment')
export class SysTaskComment extends BaseEntity {
  @Column({ name: 'task_id', length: 36, comment: '任务ID' })
  taskId: string;

  @Column({ name: 'task_no', length: 50, comment: '任务编号' })
  taskNo: string;

  @Column({ name: 'comment', type: 'text', comment: '评论内容' })
  comment: string;

  @Column({ name: 'comment_user_id', length: 36, comment: '评论人ID' })
  commentUserId: string;

  @Column({ name: 'comment_user_name', length: 50, comment: '评论人姓名' })
  commentUserName: string;
}