import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_role_menu')
export class RoleMenu extends BaseEntity {
  @Index()
  @Column({ name: 'role_id', length: 36, comment: '角色ID' })
  roleId: string;

  @Index()
  @Column({ name: 'menu_id', length: 36, comment: '菜单ID' })
  menuId: string;
}
