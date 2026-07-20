import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('fin_fixed_asset')
@Index('UQ_fin_fixed_asset_purchase_source', ['sourceType', 'sourceEntryId', 'sourceSequence'], { unique: true, where: 'source_entry_id IS NOT NULL' })
export class FinFixedAsset extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'asset_no', length: 50, comment: '资产编号' })
  assetNo: string;

  @Column({ name: 'source_type', length: 30, nullable: true }) sourceType: string;
  @Column({ name: 'source_id', length: 36, nullable: true }) sourceId: string;
  @Column({ name: 'source_no', length: 50, nullable: true }) sourceNo: string;
  @Column({ name: 'source_entry_id', length: 36, nullable: true }) sourceEntryId: string;
  @Column({ name: 'source_sequence', type: 'int', default: 1 }) sourceSequence: number;
  @Column({ name: 'asset_acceptance_id', length: 36, nullable: true }) assetAcceptanceId: string;
  @Column({ name: 'asset_acceptance_entry_id', length: 36, nullable: true }) assetAcceptanceEntryId: string;
  @Column({ name: 'inventory_out_id', length: 36, nullable: true }) inventoryOutId: string;
  @Column({ name: 'inventory_out_entry_id', length: 36, nullable: true }) inventoryOutEntryId: string;
  @Column({ name: 'purchase_order_id', length: 36, nullable: true }) purchaseOrderId: string;
  @Column({ name: 'purchase_order_entry_id', length: 36, nullable: true }) purchaseOrderEntryId: string;
  @Column({ name: 'purchase_request_id', length: 36, nullable: true }) purchaseRequestId: string;
  @Column({ name: 'purchase_request_entry_id', length: 36, nullable: true }) purchaseRequestEntryId: string;
  @Column({ type: 'decimal', precision: 18, scale: 4, default: 1 }) quantity: number;

  @Column({ name: 'asset_name', length: 200, comment: '资产名称' })
  assetName: string;

  @Column({ name: 'asset_type', length: 50, comment: '资产类型: building-房屋 building_right-房屋使用权 machine-机器设备 vehicle-运输设备 office-办公设备 other-其他' })
  assetType: string;

  @Column({ name: 'category_code', length: 50, nullable: true, comment: '资产类别编码' })
  categoryCode: string;

  @Column({ name: 'brand', length: 100, nullable: true, comment: '品牌' })
  brand: string;

  @Column({ name: 'model', length: 100, nullable: true, comment: '型号' })
  model: string;

  @Column({ name: 'specification', length: 200, nullable: true, comment: '规格' })
  specification: string;

  @Column({ name: 'manufacturer', length: 200, nullable: true, comment: '制造商' })
  manufacturer: string;

  @Column({ name: 'purchase_date', type: 'datetime', comment: '购入日期' })
  purchaseDate: Date;

  @Column({ name: 'purchase_price', type: 'decimal', precision: 18, scale: 2, comment: '购入金额' })
  purchasePrice: number;

  @Column({ name: 'salvage_value', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '残值' })
  salvageValue: number;

  @Column({ name: 'useful_life', type: 'int', comment: '使用年限(月)' })
  usefulLife: number;

  @Column({ name: 'accumulated_depreciation', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '累计折旧' })
  accumulatedDepreciation: number;

  @Column({ name: 'net_value', type: 'decimal', precision: 18, scale: 2, comment: '净值' })
  netValue: number;

  @Column({ name: 'depreciation_method', length: 50, default: 'straight_line', comment: '折旧方法: straight_line-直线法 declining_balance-双倍余额递减法 sum_years-年数总和法' })
  depreciationMethod: string;

  @Column({ name: 'department_id', length: 36, nullable: true, comment: '使用部门ID' })
  departmentId: string;

  @Column({ name: 'location', length: 200, nullable: true, comment: '存放位置' })
  location: string;

  @Column({ name: 'status', type: 'int', default: 1, comment: '状态: 0-闲置 1-使用中 2-维修中 3-报废 4-已出售' })
  status: number;

  @Column({ name: 'scrapped_at', type: 'datetime', nullable: true, comment: '报废日期' })
  scrappedAt: Date;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}
