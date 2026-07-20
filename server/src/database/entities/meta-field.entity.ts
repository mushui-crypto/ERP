import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('meta_field')
export class MetaField extends BaseEntity {
  @Index()
  @Column({ name: 'entity_id', length: 36, comment: '所属实体ID' })
  entityId: string;

  @Column({ name: 'field_code', length: 50, comment: '字段编码' })
  fieldCode: string;

  @Column({ name: 'field_name', length: 200, comment: '字段名称' })
  fieldName: string;

  @Column({ name: 'field_type', length: 50, comment: '字段类型: string/number/date/boolean/decimal/text/select' })
  fieldType: string;

  @Column({ name: 'field_length', type: 'int', default: 200, comment: '字段长度' })
  fieldLength: number;

  @Column({ name: 'is_required',  default: 0, comment: '是否必填' })
  isRequired: number;

  @Column({ name: 'is_unique',  default: 0, comment: '是否唯一' })
  isUnique: number;

  @Column({ name: 'is_searchable',  default: 0, comment: '是否可搜索' })
  isSearchable: number;

  @Column({ name: 'is_list_visible',  default: 1, comment: '是否列表可见' })
  isListVisible: number;

  @Column({ name: 'default_value', length: 200, nullable: true, comment: '默认值' })
  defaultValue: string;

  @Column({ name: 'dict_code', length: 50, nullable: true, comment: '字典编码' })
  dictCode: string;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
