import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('biz_inventory')
export class Inventory extends BaseEntity {
  @Index('UQ_biz_inventory_dimension_key', { unique: true })
  @Column({ name: 'dimension_key', length: 255, comment: '库存维度唯一键：仓库+物料+批次' })
  dimensionKey: string;

  @Index()
  @Column({ name: 'warehouse_id', length: 36, comment: '仓库ID' })
  warehouseId: string;

  @Index()
  @Column({ name: 'material_id', length: 36, comment: '物料ID' })
  materialId: string;

  @Column({ name: 'batch_no', length: 100, nullable: true, comment: '批次号' })
  batchNo: string;

  @Column({ name: 'serial_no', length: 50, nullable: true, comment: '序列号' })
  serialNo: string;

  @Column({ name: 'quantity', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '库存数量' })
  quantity: number;

  @Column({ name: 'locked_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '锁定数量' })
  lockedQty: number;

  @Column({ name: 'available_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '可用数量' })
  availableQty: number;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 18, scale: 6, default: 0, comment: '单位成本' })
  unitCost: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '总成本' })
  totalCost: number;

  @Column({ name: 'inbound_date', type: 'datetime', nullable: true, comment: '入库日期' })
  inboundDate: Date;

  @Column({ name: 'expiry_date', type: 'datetime', nullable: true, comment: '过期日期' })
  expiryDate: Date;

  @Column({ type: 'int', default: 1, comment: '状态' })
  status: number;
}
