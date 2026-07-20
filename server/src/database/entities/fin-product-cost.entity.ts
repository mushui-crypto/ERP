import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('fin_product_cost')
export class FinProductCost extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'cost_no', length: 50, comment: '成本编号' })
  costNo: string;

  @Column({ name: 'product_id', length: 36, comment: '产品ID' })
  productId: string;

  @Column({ name: 'product_code', length: 50, comment: '产品编码' })
  productCode: string;

  @Column({ name: 'product_name', length: 200, comment: '产品名称' })
  productName: string;

  @Column({ name: 'version', length: 20, comment: '版本号' })
  version: string;

  @Column({ name: 'material_cost', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '原材料成本' })
  materialCost: number;

  @Column({ name: 'labor_cost', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '人工成本' })
  laborCost: number;

  @Column({ name: 'overhead_cost', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '制造费用' })
  overheadCost: number;

  @Column({ name: 'total_cost', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '总成本' })
  totalCost: number;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '单位成本' })
  unitCost: number;

  @Column({ name: 'cost_date', type: 'datetime', comment: '成本核算日期' })
  costDate: Date;

  @Column({ name: 'status', type: 'int', default: 0, comment: '状态: 0-核算中 1-已完成 2-已作废' })
  status: number;

  @Column({ name: 'calculated_by', length: 50, nullable: true, comment: '核算人' })
  calculatedBy: string;

  @Column({ name: 'calculated_at', type: 'datetime', nullable: true, comment: '核算时间' })
  calculatedAt: Date;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}