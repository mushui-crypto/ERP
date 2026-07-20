import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('master_position')
export class Position extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'position_code', length: 50, comment: '岗位编码' })
  positionCode: string;

  @Column({ name: 'position_name', length: 100, comment: '岗位名称' })
  positionName: string;

  @Column({ name: 'dept_id', length: 36, nullable: true, comment: '所属部门ID' })
  deptId: string;

  @Column({ name: 'level', type: 'int', default: 1, comment: '岗位级别' })
  level: number;

  @Column({ length: 500, nullable: true, comment: '岗位描述' })
  description: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
