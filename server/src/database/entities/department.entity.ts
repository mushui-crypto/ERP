import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('master_department')
export class Department extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'dept_code', length: 50, comment: '部门编码' })
  deptCode: string;

  @Column({ name: 'dept_name', length: 100, comment: '部门名称' })
  deptName: string;

  @Column({ name: 'parent_id', length: 36, nullable: true, comment: '父级部门ID' })
  parentId: string;

  @Column({ name: 'manager_id', length: 36, nullable: true, comment: '部门负责人ID' })
  managerId: string;

  @Column({ length: 20, nullable: true, comment: '电话' })
  phone: string;

  @Column({ length: 100, nullable: true, comment: '邮箱' })
  email: string;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
