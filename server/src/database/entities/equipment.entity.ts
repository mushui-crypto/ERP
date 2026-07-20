import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('eq_equipment')
export class Equipment extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'equipment_code', length: 50, comment: '设备编码' })
  equipmentCode: string;

  @Column({ name: 'equipment_name', length: 100, comment: '设备名称' })
  equipmentName: string;

  @Column({ name: 'equipment_type', type: 'int', comment: '设备类型: 1-生产设备 2-检测设备 3-搬运设备 4-辅助设备' })
  equipmentType: number;

  @Column({ length: 100, nullable: true, comment: '型号' })
  model: string;

  @Column({ length: 100, nullable: true, comment: '制造商' })
  manufacturer: string;

  @Column({ name: 'purchase_date', type: 'datetime', nullable: true, comment: '购买日期' })
  purchaseDate: Date;

  @Column({ name: 'purchase_price', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '购买价格' })
  purchasePrice: number;

  @Column({ length: 200, nullable: true, comment: '存放位置' })
  location: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1-运行 2-待机 3-维修 4-停用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
