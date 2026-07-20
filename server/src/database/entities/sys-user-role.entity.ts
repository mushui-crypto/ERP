import { Entity, Column, Index, PrimaryColumn } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_user_role')
export class SysUserRole extends BaseEntity {
  @PrimaryColumn({ name: 'user_id', length: 36, comment: '用户ID' })
  userId: string;

  @PrimaryColumn({ name: 'role_id', length: 36, comment: '角色ID' })
  roleId: string;
}