import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('plm_product')
export class PlmProduct extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'product_code', length: 50, comment: '产品编码' })
  productCode: string;

  @Column({ name: 'product_name', length: 200, comment: '产品名称' })
  productName: string;

  @Column({ name: 'product_name_en', length: 300, nullable: true, comment: '产品英文名称' })
  productNameEn: string;

  @Column({ name: 'product_type', length: 50, nullable: true, comment: '产品类型' })
  productType: string;

  @Column({ name: 'category_code', length: 50, nullable: true, comment: '产品类别编码' })
  categoryCode: string;

  @Column({ name: 'brand', length: 100, nullable: true, comment: '品牌' })
  brand: string;

  @Column({ name: 'model', length: 100, nullable: true, comment: '型号' })
  model: string;

  @Column({ name: 'specification', length: 500, nullable: true, comment: '规格' })
  specification: string;

  @Column({ name: 'unit', length: 20, nullable: true, comment: '计量单位' })
  unit: string;

  @Column({ name: 'version', length: 20, default: 'V1.0', comment: '版本号' })
  version: string;

  @Column({ name: 'status', type: 'int', default: 1, comment: '状态: 0-草稿 1-生效 2-淘汰' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '产品描述' })
  description: string;

  @Column({ name: 'bom_id', length: 36, nullable: true, comment: 'BOM ID' })
  bomId: string;

  @Column({ name: 'standard_cost', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '标准成本' })
  standardCost: number;

  @Column({ name: 'list_price', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '标价' })
  listPrice: number;

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

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}