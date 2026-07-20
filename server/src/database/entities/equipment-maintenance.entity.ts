import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('eq_maintenance')
export class EquipmentMaintenance extends BaseEntity {
  @Index()
  @Column({ name: 'equipment_id', length: 36, comment: '设备ID' })
  equipmentId: string;

  @Column({ name: 'maintenance_type', type: 'int', comment: '保养类型: 1-日常保养 2-定期保养 3-大修' })
  maintenanceType: number;

  @Column({ name: 'maintenance_date', type: 'datetime', comment: '保养日期' })
  maintenanceDate: Date;

  @Column({ length: 50, nullable: true, comment: '执行人' })
  executor: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, comment: '费用' })
  cost: number;

  @Column({ length: 500, nullable: true, comment: '保养结果' })
  result: string;

  @Column({ name: 'next_date', type: 'datetime', nullable: true, comment: '下次保养日期' })
  nextDate: Date;

  @Column({ type: 'int', default: 1, comment: '状态: 1-已完成 0-待执行' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
