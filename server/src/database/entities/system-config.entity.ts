import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_config')
export class SystemConfig extends BaseEntity {
  @Index()
  @Column({ name: 'config_group', length: 50, comment: '配置分组' })
  configGroup: string;

  @Index({ unique: true })
  @Column({ name: 'config_key', length: 100, comment: '配置键' })
  configKey: string;

  @Column({ name: 'config_value', type: 'text', nullable: true, comment: '配置值' })
  configValue: string;

  @Column({ name: 'config_name', length: 200, comment: '配置名称' })
  configName: string;

  @Column({ name: 'value_type', length: 20, default: 'string', comment: '值类型: string/number/boolean/json' })
  valueType: string;

  @Column({ name: 'description', length: 500, nullable: true, comment: '描述' })
  description: string;

  @Column({ name: 'is_editable', type: 'tinyint', default: 1, comment: '是否可编辑' })
  isEditable: number;

  @Column({ name: 'is_system',  default: 0, comment: '是否系统内置' })
  isSystem: number;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ name: 'sort_order', type: 'int', default: 0, comment: '排序' })
  sortOrder: number;
}