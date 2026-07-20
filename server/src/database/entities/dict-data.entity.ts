import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_dict_data')
export class DictData extends BaseEntity {
  @Index()
  @Column({ name: 'dict_code', length: 50, comment: '字典编码' })
  dictCode: string;

  @Column({ name: 'dict_value', length: 200, comment: '字典值' })
  dictValue: string;

  @Column({ name: 'dict_label', length: 200, comment: '字典标签' })
  dictLabel: string;

  @Column({ name: 'parent_value', length: 200, nullable: true, comment: '父级值' })
  parentValue: string;

  @Column({ type: 'int', default: 0, comment: '层级' })
  level: number;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}