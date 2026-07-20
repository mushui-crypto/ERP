import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('master_material')
export class Material extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'material_code', length: 50, comment: '物料编码' })
  materialCode: string;

  @Column({ name: 'material_name', length: 200, comment: '物料名称' })
  materialName: string;

  @Column({ name: 'material_spec', length: 200, nullable: true, comment: '规格型号' })
  materialSpec: string;

  @Column({ name: 'category_id', length: 36, nullable: true, comment: '分类ID' })
  categoryId: string;

  @Column({ name: 'unit_id', length: 36, nullable: true, comment: '基本单位ID' })
  unitId: string;

  @Column({ name: 'material_type', type: 'int', default: 1, comment: '物料属性: 1-自制 2-采购 3-委外 4-虚拟' })
  materialType: number;

  @Column({ name: 'purchase_type', type: 'int', nullable: true, comment: '采购类型: 1-外购 2-自制 3-委外' })
  purchaseType: number;

  @Column({ name: 'barcode', length: 100, nullable: true, comment: '条形码' })
  barcode: string;

  @Column({ name: 'default_warehouse', length: 36, nullable: true, comment: '默认仓库' })
  defaultWarehouse: string;

  @Column({ name: 'safety_stock', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '安全库存' })
  safetyStock: number;

  @Column({ name: 'min_order_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '最小订货量' })
  minOrderQty: number;

  @Column({ name: 'lead_time', type: 'int', default: 0, comment: '采购提前期(天)' })
  leadTime: number;

  @Column({ name: 'standard_cost', type: 'decimal', precision: 18, scale: 6, default: 0, comment: '标准成本' })
  standardCost: number;

  @Column({ name: 'sale_price', type: 'decimal', precision: 18, scale: 6, default: 0, comment: '销售单价' })
  salePrice: number;

  @Column({ name: 'is_batch_manage',  default: 0, comment: '是否批次管理' })
  isBatchManage: number;

  @Column({ name: 'is_serial_manage',  default: 0, comment: '是否序列号管理' })
  isSerialManage: number;

  @Column({ name: 'shelf_life_days', type: 'int', default: 0, comment: '保质期天数' })
  shelfLifeDays: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;
}
