import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('fin_asset_category')
export class FinAssetCategory extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'category_code', length: 50, comment: '资产类别编码' })
  categoryCode: string;

  @Column({ name: 'category_name', length: 200, comment: '资产类别名称' })
  categoryName: string;

  @Column({ name: 'asset_type', length: 50, comment: '固定资产类型' })
  assetType: string;

  @Column({ name: 'useful_life_months', type: 'int', comment: '默认使用年限（月）' })
  usefulLifeMonths: number;

  @Column({ name: 'salvage_rate', type: 'decimal', precision: 9, scale: 4, default: 0, comment: '默认残值率（%）' })
  salvageRate: number;

  @Column({ name: 'depreciation_method', length: 50, default: 'straight_line', comment: '默认折旧方法' })
  depreciationMethod: string;

  @Column({ type: 'int', default: 1, comment: '状态：0停用 1启用' })
  status: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}
