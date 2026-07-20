import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_user_role')
export class UserRole extends BaseEntity {
  @Index()
  @Column({ name: 'user_id', length: 36, comment: '用户ID' })
  userId: string;

  @Index()
  @Column({ name: 'role_id', length: 36, comment: '角色ID' })
  roleId: string;
}
