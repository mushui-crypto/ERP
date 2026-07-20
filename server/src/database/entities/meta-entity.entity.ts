import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('meta_entity')
export class MetaEntity extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'entity_code', length: 50, comment: '实体编码' })
  entityCode: string;

  @Column({ name: 'entity_name', length: 200, comment: '实体名称' })
  entityName: string;

  @Column({ name: 'table_name', length: 100, comment: '表名' })
  tableName: string;

  @Column({ name: 'description', length: 500, nullable: true, comment: '描述' })
  description: string;

  @Column({ name: 'is_system',  default: 0, comment: '是否系统内置' })
  isSystem: number;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
