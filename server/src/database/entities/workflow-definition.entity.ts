import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_workflow_definition')
export class WorkflowDefinition extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'workflow_code', length: 50, comment: '流程编码' })
  workflowCode: string;

  @Column({ name: 'workflow_name', length: 200, comment: '流程名称' })
  workflowName: string;

  @Column({ name: 'description', type: 'text', nullable: true, comment: '流程描述' })
  description: string;

  @Column({ name: 'business_type', length: 100, comment: '业务类型' })
  businessType: string;

  @Column({ name: 'start_form_id', length: 36, nullable: true, comment: '启动表单ID' })
  startFormId: string;

  @Column({ name: 'is_enabled', type: 'int', default: 1, comment: '是否启用: 1-启用 0-禁用' })
  isEnabled: number;

  @Column({ name: 'is_default', type: 'int', default: 0, comment: '是否默认: 1-是 0-否' })
  isDefault: number;

  @Column({ name: 'version', type: 'int', default: 1, comment: '版本号' })
  version: number;
}