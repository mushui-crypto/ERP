import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_role')
export class Role extends BaseEntity {
  @Index({ unique: true })
  @Column({ length: 50, comment: '角色编码' })
  code: string;

  @Column({ length: 100, comment: '角色名称' })
  name: string;

  @Column({ name: 'data_scope', type: 'int', default: 1, comment: '数据范围: 1-全部 2-本组织 3-本部门 4-本人' })
  dataScope: number;

  @Column({ name: 'org_id', length: 36, nullable: true, comment: '所属组织ID（为空表示系统角色）' })
  orgId: string;

  @Column({ type: 'text', nullable: true, comment: '功能权限JSON' })
  permissions: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}
