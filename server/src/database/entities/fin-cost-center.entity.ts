import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('fin_cost_center')
export class FinCostCenter extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'cost_center_code', length: 50, comment: '成本中心编码' })
  costCenterCode: string;

  @Column({ name: 'cost_center_name', length: 200, comment: '成本中心名称' })
  costCenterName: string;

  @Column({ name: 'parent_id', length: 36, nullable: true, comment: '上级成本中心ID' })
  parentId: string;

  @Column({ name: 'org_id', length: 36, nullable: true, comment: '组织ID' })
  orgId: string;

  @Column({ name: 'department_id', length: 36, nullable: true, comment: '部门ID' })
  departmentId: string;

  @Column({ type: 'text', nullable: true, comment: '成本中心描述' })
  description: string;

  @Column({ name: 'is_enabled', type: 'int', default: 1, comment: '是否启用: 1-启用 0-禁用' })
  isEnabled: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}