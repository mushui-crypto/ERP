import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('plm_material')
export class PlmMaterial extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'material_code', length: 50, comment: '物料编码' })
  materialCode: string;

  @Column({ name: 'material_name', length: 200, comment: '物料名称' })
  materialName: string;

  @Column({ name: 'material_name_en', length: 300, nullable: true, comment: '物料英文名称' })
  materialNameEn: string;

  @Column({ name: 'material_type', length: 50, comment: '物料类型: raw-原材料 semi-半成品 finished-成品 packaging-包装材料 tool-工具' })
  materialType: string;

  @Column({ name: 'category_code', length: 50, nullable: true, comment: '物料类别编码' })
  categoryCode: string;

  @Column({ name: 'specification', length: 500, nullable: true, comment: '规格' })
  specification: string;

  @Column({ name: 'unit', length: 20, nullable: true, comment: '计量单位' })
  unit: string;

  @Column({ name: 'version', length: 20, default: 'V1.0', comment: '版本号' })
  version: string;

  @Column({ name: 'status', type: 'int', default: 1, comment: '状态: 0-草稿 1-生效 2-淘汰' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '物料描述' })
  description: string;

  @Column({ name: 'supplier_id', length: 36, nullable: true, comment: '主供应商ID' })
  supplierId: string;

  @Column({ name: 'supplier_code', length: 50, nullable: true, comment: '供应商编码' })
  supplierCode: string;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '单位成本' })
  unitCost: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '采购单价' })
  unitPrice: number;

  @Column({ name: 'weight', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '重量' })
  weight: number;

  @Column({ name: 'volume', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '体积' })
  volume: number;

  @Column({ name: 'safety_stock', type: 'int', default: 0, comment: '安全库存' })
  safetyStock: number;

  @Column({ name: 'min_order_qty', type: 'int', default: 1, comment: '最小订购量' })
  minOrderQty: number;

  @Column({ name: 'lead_time', type: 'int', default: 0, comment: '提前期(天)' })
  leadTime: number;

  @Column({ name: 'batch_no', length: 50, nullable: true, comment: '批次号' })
  batchNo: string;

  @Column({ name: 'expiry_date', type: 'datetime', nullable: true, comment: '有效期' })
  expiryDate: Date;

  @Column({ name: 'is_serial', type: 'int', default: 0, comment: '是否需要序列号管理: 1-是 0-否' })
  isSerial: number;

  @Column({ name: 'is_batch', type: 'int', default: 0, comment: '是否需要批次管理: 1-是 0-否' })
  isBatch: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}