import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_workflow_task')
export class WorkflowTask extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'task_no', length: 50, comment: '任务编号' })
  taskNo: string;

  @Column({ name: 'instance_id', length: 36, comment: '流程实例ID' })
  instanceId: string;

  @Column({ name: 'instance_no', length: 50, comment: '流程实例编号' })
  instanceNo: string;

  @Column({ name: 'workflow_id', length: 36, comment: '流程定义ID' })
  workflowId: string;

  @Column({ name: 'workflow_code', length: 50, comment: '流程编码' })
  workflowCode: string;

  @Column({ name: 'node_id', length: 36, comment: '节点ID' })
  nodeId: string;

  @Column({ name: 'node_code', length: 50, comment: '节点编码' })
  nodeCode: string;

  @Column({ name: 'node_name', length: 100, comment: '节点名称' })
  nodeName: string;

  @Column({ name: 'business_type', length: 100, comment: '业务类型' })
  businessType: string;

  @Column({ name: 'business_id', length: 36, comment: '业务数据ID' })
  businessId: string;

  @Column({ name: 'business_no', length: 50, nullable: true, comment: '业务单据编号' })
  businessNo: string;

  @Column({ name: 'business_title', length: 500, nullable: true, comment: '业务标题' })
  businessTitle: string;

  @Column({ name: 'assignee_id', length: 36, comment: '处理人ID' })
  assigneeId: string;

  @Column({ name: 'assignee_name', length: 50, comment: '处理人姓名' })
  assigneeName: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1-待处理 2-已处理 3-已转办 4-已超时' })
  status: number;

  @Column({ name: 'priority', type: 'int', default: 2, comment: '优先级: 1-高 2-中 3-低' })
  priority: number;

  @Column({ name: 'create_time', type: 'datetime', comment: '创建时间' })
  createTime: Date;

  @Column({ name: 'claim_time', type: 'datetime', nullable: true, comment: '认领时间' })
  claimTime: Date;

  @Column({ name: 'complete_time', type: 'datetime', nullable: true, comment: '完成时间' })
  completeTime: Date;

  @Column({ name: 'action', length: 50, nullable: true, comment: '处理动作: approve-通过 reject-驳回 delegate-转办' })
  action: string;

  @Column({ name: 'comment', type: 'text', nullable: true, comment: '处理意见' })
  comment: string;

  @Column({ name: 'timeout_time', type: 'datetime', nullable: true, comment: '超时时间' })
  timeoutTime: Date;
}