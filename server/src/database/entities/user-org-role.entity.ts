import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('sys_user_org_role')
export class UserOrgRole {
  @PrimaryColumn({ name: 'user_id', length: 36, comment: '用户ID' })
  userId: string;

  @PrimaryColumn({ name: 'org_id', length: 36, comment: '组织ID' })
  orgId: string;

  @PrimaryColumn({ name: 'role_id', length: 36, comment: '角色ID' })
  roleId: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ name: 'created_at', type: 'datetime', default: () => 'GETDATE()', comment: '创建时间' })
  createdAt: Date;
}