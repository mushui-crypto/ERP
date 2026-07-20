import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('workflow')
export class Workflow extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'workflow_code', length: 50, comment: '工作流编码' })
  workflowCode: string;

  @Column({ name: 'workflow_name', length: 200, comment: '工作流名称' })
  workflowName: string;

  @Column({ name: 'workflow_type', type: 'int', comment: '工作流类型: 1-审批流 2-业务流 3-通知流' })
  workflowType: number;

  @Column({ length: 20, default: '1.0', comment: '版本' })
  version: string;

  @Column({ name: 'description', length: 500, nullable: true, comment: '描述' })
  description: string;

  @Column({ name: 'process_xml', type: 'text', nullable: true, comment: '流程XML' })
  processXml: string;

  @Column({ name: 'process_json', type: 'text', nullable: true, comment: '流程JSON' })
  processJson: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
