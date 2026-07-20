import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('ai_conversation')
export class AiConversation extends BaseEntity {
  @Index()
  @Column({ name: 'user_id', length: 36, comment: '用户ID' })
  userId: string;

  @Index()
  @Column({ name: 'session_id', length: 50, comment: '会话ID' })
  sessionId: string;

  @Column({ length: 20, comment: '角色: user/assistant' })
  role: string;

  @Column({ type: 'text', comment: '对话内容' })
  content: string;

  @Column({ name: 'module_type', length: 50, nullable: true, comment: '模块类型，标识来自哪个模块的问答' })
  moduleType: string;

  @Column({ type: 'int', default: 0, comment: 'token消耗' })
  tokens: number;

  @Column({ name: 'response_time', type: 'int', default: 0, comment: '响应时间(毫秒)' })
  responseTime: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
