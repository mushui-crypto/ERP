import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('inventory_out')
export class InventoryOut extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'out_no', length: 50, comment: '出库单号' })
  outNo: string;

  @Column({ name: 'org_id', length: 36, comment: '组织ID' })
  orgId: string;

  @Column({ name: 'warehouse_id', length: 36, comment: '仓库ID' })
  warehouseId: string;

  @Column({ name: 'warehouse_code', length: 50, comment: '仓库编码' })
  warehouseCode: string;

  @Column({ name: 'warehouse_name', length: 200, comment: '仓库名称' })
  warehouseName: string;

  @Column({ name: 'out_type', type: 'int', comment: '出库类型: 1-销售出库 2-生产领料 3-采购退货出库 4-其他出库' })
  outType: number;

  @Column({ name: 'source_id', length: 36, nullable: true, comment: '来源单据ID' })
  sourceId: string;

  @Column({ name: 'source_no', length: 50, nullable: true, comment: '来源单据号' })
  sourceNo: string;

  @Column({ name: 'customer_id', length: 36, nullable: true, comment: '客户ID' })
  customerId: string;

  @Column({ name: 'customer_code', length: 50, nullable: true, comment: '客户编码' })
  customerCode: string;

  @Column({ name: 'customer_name', length: 200, nullable: true, comment: '客户名称' })
  customerName: string;

  @Column({ name: 'department_id', length: 36, nullable: true, comment: '领用部门ID' })
  departmentId: string;

  @Column({ name: 'department_code', length: 50, nullable: true, comment: '领用部门编码' })
  departmentCode: string;

  @Column({ name: 'department_name', length: 200, nullable: true, comment: '领用部门名称' })
  departmentName: string;

  @Column({ name: 'material_id', length: 36, comment: '物料ID' })
  materialId: string;

  @Column({ name: 'material_code', length: 50, comment: '物料编码' })
  materialCode: string;

  @Column({ name: 'material_name', length: 200, comment: '物料名称' })
  materialName: string;

  @Column({ name: 'spec', length: 200, nullable: true, comment: '规格型号' })
  spec: string;

  @Column({ name: 'unit_id', length: 36, comment: '计量单位ID' })
  unitId: string;

  @Column({ name: 'unit_code', length: 50, comment: '计量单位编码' })
  unitCode: string;

  @Column({ name: 'unit_name', length: 50, comment: '计量单位名称' })
  unitName: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, comment: '出库数量' })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, comment: '单价' })
  unitPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, comment: '金额' })
  amount: number;

  @Column({ name: 'lot_no', length: 50, nullable: true, comment: '批号' })
  lotNo: string;

  @Column({ name: 'location', length: 100, nullable: true, comment: '库位' })
  location: string;

  @Column({ name: 'out_date', type: 'datetime', comment: '出库日期' })
  outDate: Date;

  @Column({ type: 'int', default: 0, comment: '状态: 0-草稿 1-待审核 2-已审核 3-已取消' })
  status: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}