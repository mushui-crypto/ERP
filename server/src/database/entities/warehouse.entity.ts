import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('master_warehouse')
export class Warehouse extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'warehouse_code', length: 50, comment: '仓库编码' })
  warehouseCode: string;

  @Column({ name: 'warehouse_name', length: 100, comment: '仓库名称' })
  warehouseName: string;

  @Column({ name: 'warehouse_type', type: 'int', default: 1, comment: '仓库类型: 1-原料仓 2-成品仓 3-半成品仓 4-包装材仓 5-不良品仓 6-返修仓' })
  warehouseType: number;

  @Column({ name: 'parent_id', length: 36, nullable: true, comment: '父级仓库ID' })
  parentId: string;

  @Column({ name: 'manager_id', length: 36, nullable: true, comment: '仓库管理员ID' })
  managerId: string;

  @Column({ length: 200, nullable: true, comment: '地址' })
  address: string;

  @Column({ name: 'is_default',  default: 0, comment: '是否默认仓库' })
  isDefault: number;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
