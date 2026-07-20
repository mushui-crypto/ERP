import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('master_material_category')
export class MaterialCategory extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'category_code', length: 50, comment: '分类编码' })
  categoryCode: string;

  @Column({ name: 'category_name', length: 100, comment: '分类名称' })
  categoryName: string;

  @Column({ name: 'parent_id', length: 36, nullable: true, comment: '父级分类ID' })
  parentId: string;

  @Column({ name: 'level', type: 'int', default: 1, comment: '层级' })
  level: number;

  @Column({ name: 'is_leaf',  default: 1, comment: '是否叶子节点' })
  isLeaf: number;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
