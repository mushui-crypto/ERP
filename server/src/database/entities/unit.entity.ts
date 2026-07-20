import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('master_unit')
export class Unit extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'unit_code', length: 50, comment: '计量单位编码' })
  unitCode: string;

  @Column({ name: 'unit_name', length: 100, comment: '计量单位名称' })
  unitName: string;

  @Column({ name: 'unit_type', type: 'int', default: 1, comment: '单位类型: 1-数量 2-重量 3-长度 4-面积 5-体积 6-时间' })
  unitType: number;

  @Column({ name: 'precision', type: 'int', default: 2, comment: '精度' })
  precision: number;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
