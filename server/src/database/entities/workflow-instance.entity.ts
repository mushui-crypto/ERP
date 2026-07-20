import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_workflow_instance')
export class WorkflowInstance extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'instance_no', length: 50, comment: '流程实例编号' })
  instanceNo: string;

  @Column({ name: 'workflow_id', length: 36, comment: '流程定义ID' })
  workflowId: string;

  @Column({ name: 'workflow_code', length: 50, comment: '流程编码' })
  workflowCode: string;

  @Column({ name: 'workflow_name', length: 200, comment: '流程名称' })
  workflowName: string;

  @Column({ name: 'business_type', length: 100, comment: '业务类型' })
  businessType: string;

  @Column({ name: 'business_id', length: 36, comment: '业务数据ID' })
  businessId: string;

  @Column({ name: 'business_no', length: 50, nullable: true, comment: '业务单据编号' })
  businessNo: string;

  @Column({ name: 'business_title', length: 500, nullable: true, comment: '业务标题' })
  businessTitle: string;

  @Column({ name: 'creator_id', length: 36, comment: '发起人ID' })
  creatorId: string;

  @Column({ name: 'creator_name', length: 50, comment: '发起人姓名' })
  creatorName: string;

  @Column({ name: 'current_node_id', length: 36, comment: '当前节点ID' })
  currentNodeId: string;

  @Column({ name: 'current_node_name', length: 100, comment: '当前节点名称' })
  currentNodeName: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1-运行中 2-已完成 3-已终止 4-已驳回' })
  status: number;

  @Column({ name: 'start_time', type: 'datetime', comment: '启动时间' })
  startTime: Date;

  @Column({ name: 'end_time', type: 'datetime', nullable: true, comment: '结束时间' })
  endTime: Date;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}