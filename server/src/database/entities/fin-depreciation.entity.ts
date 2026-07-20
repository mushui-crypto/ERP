import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('fin_depreciation')
export class FinDepreciation extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'depreciation_no', length: 50, comment: '折旧编号' })
  depreciationNo: string;

  @Column({ name: 'asset_id', length: 36, comment: '资产ID' })
  assetId: string;

  @Column({ name: 'asset_no', length: 50, comment: '资产编号' })
  assetNo: string;

  @Column({ name: 'asset_name', length: 200, comment: '资产名称' })
  assetName: string;

  @Column({ name: 'depreciation_period', length: 10, comment: '折旧期间(YYYY-MM)' })
  depreciationPeriod: string;

  @Column({ name: 'depreciation_amount', type: 'decimal', precision: 18, scale: 2, comment: '折旧金额' })
  depreciationAmount: number;

  @Column({ name: 'accumulated_depreciation', type: 'decimal', precision: 18, scale: 2, comment: '累计折旧' })
  accumulatedDepreciation: number;

  @Column({ name: 'net_value', type: 'decimal', precision: 18, scale: 2, comment: '净值' })
  netValue: number;

  @Column({ type: 'int', default: 0, comment: '状态: 0-待审核 1-已审核' })
  status: number;

  @Column({ name: 'approved_by', length: 50, nullable: true, comment: '审核人' })
  approvedBy: string;

  @Column({ name: 'approved_at', type: 'datetime', nullable: true, comment: '审核时间' })
  approvedAt: Date;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}