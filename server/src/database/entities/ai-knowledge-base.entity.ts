import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('ai_knowledge_base')
export class AiKnowledgeBase extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'kb_code', length: 50, comment: '知识库编码' })
  kbCode: string;

  @Column({ name: 'kb_name', length: 200, comment: '知识库名称' })
  kbName: string;

  @Column({ type: 'text', nullable: true, comment: '知识库描述' })
  description: string;

  @Column({ name: 'kb_type', length: 50, comment: '知识库类型: public-公共 private-私有 department-部门' })
  kbType: string;

  @Column({ name: 'org_id', length: 36, nullable: true, comment: '组织ID' })
  orgId: string;

  @Column({ name: 'department_id', length: 36, nullable: true, comment: '部门ID' })
  departmentId: string;

  @Column({ name: 'is_enabled', type: 'int', default: 1, comment: '是否启用: 1-启用 0-禁用' })
  isEnabled: number;

  @Column({ type: 'int', default: 0, comment: '文档数量' })
  documentCount: number;

  @Column({ type: 'int', default: 0, comment: '向量数量' })
  vectorCount: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}