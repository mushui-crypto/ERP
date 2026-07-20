import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_menu')
export class Menu extends BaseEntity {
  @Column({ name: 'parent_id', length: 36, nullable: true, comment: '父级菜单ID' })
  parentId: string;

  @Column({ length: 50, comment: '菜单名称' })
  name: string;

  @Column({ length: 100, nullable: true, comment: '菜单图标' })
  icon: string;

  @Column({ name: 'menu_type', type: 'int', default: 1, comment: '菜单类型: 1-目录 2-菜单 3-按钮' })
  menuType: number;

  @Column({ length: 200, nullable: true, comment: '路由路径' })
  path: string;

  @Column({ name: 'component', length: 200, nullable: true, comment: '组件路径' })
  component: string;

  @Column({ length: 100, nullable: true, comment: '权限标识' })
  permission: string;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ name: 'is_visible',  default: 1, comment: '是否可见' })
  isVisible: number;

  @Column({ name: 'is_cache',  default: 0, comment: '是否缓存' })
  isCache: number;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;
}
