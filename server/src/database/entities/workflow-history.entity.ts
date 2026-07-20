import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_workflow_history')
export class WorkflowHistory extends BaseEntity {
  @Column({ name: 'instance_id', length: 36, comment: '流程实例ID' })
  instanceId: string;

  @Column({ name: 'instance_no', length: 50, comment: '流程实例编号' })
  instanceNo: string;

  @Column({ name: 'node_id', length: 36, comment: '节点ID' })
  nodeId: string;

  @Column({ name: 'node_code', length: 50, comment: '节点编码' })
  nodeCode: string;

  @Column({ name: 'node_name', length: 100, comment: '节点名称' })
  nodeName: string;

  @Column({ name: 'action', length: 50, comment: '动作: start-启动 approve-通过 reject-驳回 delegate-转办 skip-跳过 end-结束' })
  action: string;

  @Column({ name: 'operator_id', length: 36, comment: '操作人ID' })
  operatorId: string;

  @Column({ name: 'operator_name', length: 50, comment: '操作人姓名' })
  operatorName: string;

  @Column({ name: 'operate_time', type: 'datetime', comment: '操作时间' })
  operateTime: Date;

  @Column({ name: 'comment', type: 'text', nullable: true, comment: '操作意见' })
  comment: string;

  @Column({ name: 'business_type', length: 100, comment: '业务类型' })
  businessType: string;

  @Column({ name: 'business_id', length: 36, comment: '业务数据ID' })
  businessId: string;
}