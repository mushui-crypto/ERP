import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_workflow_line')
export class WorkflowLine extends BaseEntity {
  @Column({ name: 'workflow_id', length: 36, comment: '流程定义ID' })
  workflowId: string;

  @Column({ name: 'source_node_id', length: 36, comment: '源节点ID' })
  sourceNodeId: string;

  @Column({ name: 'target_node_id', length: 36, comment: '目标节点ID' })
  targetNodeId: string;

  @Column({ name: 'condition_type', length: 50, nullable: true, comment: '条件类型' })
  conditionType: string;

  @Column({ name: 'condition_expression', type: 'text', nullable: true, comment: '条件表达式' })
  conditionExpression: string;

  @Column({ name: 'line_name', length: 100, nullable: true, comment: '连线名称' })
  lineName: string;

  @Column({ type: 'int', default: 0, comment: '是否默认: 1-是 0-否' })
  isDefault: number;
}