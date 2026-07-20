import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('crm_customer_category')
export class CrmCustomerCategory extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'category_code', length: 50, comment: '分类编码' })
  categoryCode: string;

  @Column({ name: 'category_name', length: 100, comment: '分类名称' })
  categoryName: string;

  @Column({ name: 'parent_id', length: 36, nullable: true, comment: '上级分类ID' })
  parentId: string;

  @Column({ type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ type: 'int', default: 1, comment: '是否启用: 1-启用 0-禁用' })
  enabled: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}