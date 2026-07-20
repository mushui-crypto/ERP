import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { AssetOutRequest } from './asset-out-request.entity';

@Entity('biz_asset_out_request_entry')
@Index('UQ_asset_out_request_entry_line', ['assetOutRequestId', 'lineNo'], { unique: true })
@Index('UQ_asset_out_request_entry_acceptance', ['sourceAssetAcceptanceEntryId'], { unique: true })
export class AssetOutRequestEntry extends BaseEntity {
  @Column({ name: 'asset_out_request_id', type: 'uniqueidentifier' }) assetOutRequestId: string;
  @ManyToOne(() => AssetOutRequest, (request) => request.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_out_request_id' }) assetOutRequest: AssetOutRequest;
  @Column({ name: 'line_no', type: 'int' }) lineNo: number;
  @Column({ name: 'source_asset_acceptance_entry_id', length: 36 }) sourceAssetAcceptanceEntryId: string;
  @Column({ name: 'source_inventory_in_entry_id', length: 36 }) sourceInventoryInEntryId: string;
  @Column({ name: 'material_id', length: 36 }) materialId: string;
  @Column({ name: 'material_code', length: 50 }) materialCode: string;
  @Column({ name: 'material_name', length: 200 }) materialName: string;
  @Column({ name: 'material_model', length: 200, nullable: true }) materialModel: string;
  @Column({ name: 'unit_id', length: 36 }) unitId: string;
  @Column({ name: 'unit_code', length: 50, nullable: true }) unitCode: string;
  @Column({ name: 'unit_name', length: 50, nullable: true }) unitName: string;
  @Column({ name: 'lot_no', length: 100, nullable: true }) lotNo: string;
  @Column({ name: 'request_qty', type: 'decimal', precision: 18, scale: 4 }) requestQty: number;
  @Column({ name: 'out_qty', type: 'decimal', precision: 18, scale: 4, default: 0 }) outQty: number;
  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 4 }) unitPrice: number;
  @Column({ type: 'decimal', precision: 18, scale: 2 }) amount: number;
  @Column({ name: 'asset_category_code', length: 50 }) assetCategoryCode: string;
  @Column({ name: 'department_id', length: 36, nullable: true }) departmentId: string;
  @Column({ name: 'custodian_id', length: 36, nullable: true }) custodianId: string;
  @Column({ length: 200, nullable: true }) location: string;
}
