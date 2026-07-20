import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('fin_cost_allocation')
export class FinCostAllocation extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'allocation_no', length: 50, comment: '分配单号' })
  allocationNo: string;

  @Column({ name: 'cost_center_id', length: 36, comment: '成本中心ID' })
  costCenterId: string;

  @Column({ name: 'cost_center_code', length: 50, comment: '成本中心编码' })
  costCenterCode: string;

  @Column({ name: 'cost_center_name', length: 200, comment: '成本中心名称' })
  costCenterName: string;

  @Column({ name: 'cost_type', length: 50, comment: '成本类型: material-原材料 labor-人工 overhead-制造费用' })
  costType: string;

  @Column({ name: 'product_id', length: 36, comment: '产品ID' })
  productId: string;

  @Column({ name: 'product_code', length: 50, comment: '产品编码' })
  productCode: string;

  @Column({ name: 'product_name', length: 200, comment: '产品名称' })
  productName: string;

  @Column({ name: 'allocation_amount', type: 'decimal', precision: 18, scale: 2, comment: '分配金额' })
  allocationAmount: number;

  @Column({ name: 'allocation_qty', type: 'decimal', precision: 18, scale: 4, comment: '分配数量' })
  allocationQty: number;

  @Column({ name: 'unit_cost', type: 'decimal', precision: 18, scale: 4, comment: '单位成本' })
  unitCost: number;

  @Column({ name: 'allocation_date', type: 'datetime', comment: '分配日期' })
  allocationDate: Date;

  @Column({ type: 'text', nullable: true, comment: '分配依据' })
  basis: string;

  @Column({ type: 'int', default: 0, comment: '状态: 0-待审核 1-已审核 2-已作废' })
  status: number;

  @Column({ name: 'approved_by', length: 50, nullable: true, comment: '审核人' })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'datetime', nullable: true, comment: '审核时间' })
  approvedAt: Date;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}