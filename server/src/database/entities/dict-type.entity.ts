import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_dict_type')
export class DictType extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'dict_code', length: 50, comment: '字典编码' })
  dictCode: string;

  @Column({ name: 'dict_name', length: 200, comment: '字典名称' })
  dictName: string;

  @Column({ name: 'description', length: 500, nullable: true, comment: '描述' })
  description: string;

  @Column({ name: 'is_system',  default: 0, comment: '是否系统内置' })
  isSystem: number;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}