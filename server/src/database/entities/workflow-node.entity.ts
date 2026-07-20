import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_workflow_node')
export class WorkflowNode extends BaseEntity {
  @Column({ name: 'workflow_id', length: 36, comment: '流程定义ID' })
  workflowId: string;

  @Column({ name: 'workflow_code', length: 50, comment: '流程编码' })
  workflowCode: string;

  @Index({ unique: true })
  @Column({ name: 'node_code', length: 50, comment: '节点编码' })
  nodeCode: string;

  @Column({ name: 'node_name', length: 100, comment: '节点名称' })
  nodeName: string;

  @Column({ name: 'node_type', length: 50, comment: '节点类型: start-开始 end-结束 approval-审批 fork-分支 join-合并' })
  nodeType: string;

  @Column({ name: 'sort_order', type: 'int', comment: '排序' })
  sortOrder: number;

  @Column({ name: 'parent_node_id', length: 36, nullable: true, comment: '父节点ID' })
  parentNodeId: string;

  @Column({ name: 'assignee_type', length: 50, comment: '审批人类型: user-用户 role-角色 position-职位 dept-部门' })
  assigneeType: string;

  @Column({ name: 'assignee_ids', length: 500, nullable: true, comment: '审批人ID列表' })
  assigneeIds: string;

  @Column({ name: 'assignee_names', length: 500, nullable: true, comment: '审批人名称列表' })
  assigneeNames: string;

  @Column({ name: 'approval_type', length: 50, default: 'single', comment: '审批方式: single-单人 first-会签 all-签审' })
  approvalType: string;

  @Column({ name: 'timeout_hours', type: 'int', nullable: true, comment: '超时时间(小时)' })
  timeoutHours: number;

  @Column({ name: 'can_reject', type: 'int', default: 1, comment: '是否可驳回: 1-是 0-否' })
  canReject: number;

  @Column({ name: 'can_delegate', type: 'int', default: 1, comment: '是否可转办: 1-是 0-否' })
  canDelegate: number;
}