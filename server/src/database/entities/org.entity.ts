import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_org')
export class Org extends BaseEntity {
  @Column({ length: 100, comment: '组织名称' })
  name: string;

  @Column({ length: 50, comment: '组织编码' })
  code: string;

  @Column({ name: 'parent_id', length: 36, nullable: true, comment: '父级ID' })
  parentId: string;

  @Column({ name: 'org_type', type: 'int', default: 1, comment: '组织类型: 1-集团 2-公司 3-工厂 4-车间 5-班组' })
  orgType: number;

  @Column({ name: 'data_center_id', length: 36, comment: '数据中心ID' })
  dataCenterId: string;

  @Column({ name: 'full_name', length: 200, nullable: true, comment: '全称' })
  fullName: string;

  @Column({ name: 'short_name', length: 100, nullable: true, comment: '简称' })
  shortName: string;

  @Column({ length: 20, nullable: true, comment: '联系人' })
  contact: string;

  @Column({ length: 20, nullable: true, comment: '联系电话' })
  phone: string;

  @Column({ length: 200, nullable: true, comment: '地址' })
  address: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;
}
