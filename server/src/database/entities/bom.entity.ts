import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('master_bom')
export class Bom extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'bom_no', length: 50, comment: 'BOM编号' })
  bomNo: string;

  @Column({ name: 'material_id', length: 36, comment: '物料ID' })
  materialId: string;

  @Column({ name: 'version', length: 20, default: '1.0', comment: '版本' })
  version: string;

  @Column({ name: 'is_default',  default: 1, comment: '是否默认' })
  isDefault: number;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
