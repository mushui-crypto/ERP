import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { AssetAcceptance } from './asset-acceptance.entity';

@Entity('biz_asset_acceptance_entry')
@Index('UQ_asset_acceptance_entry_line', ['assetAcceptanceId', 'lineNo'], { unique: true })
@Index('IDX_asset_acceptance_entry_receive', ['sourceReceiveNoticeEntryId'])
@Index('IDX_asset_acceptance_entry_inbound', ['sourceInventoryInEntryId'])
export class AssetAcceptanceEntry extends BaseEntity {
  @Column({ name: 'asset_acceptance_id', type: 'uniqueidentifier' }) assetAcceptanceId: string;
  @ManyToOne(() => AssetAcceptance, (acceptance) => acceptance.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'asset_acceptance_id' }) assetAcceptance: AssetAcceptance;
  @Column({ name: 'line_no', type: 'int' }) lineNo: number;
  @Column({ name: 'source_receive_notice_id', length: 36, nullable: true }) sourceReceiveNoticeId: string;
  @Column({ name: 'source_receive_notice_entry_id', length: 36, nullable: true }) sourceReceiveNoticeEntryId: string;
  @Column({ name: 'source_inventory_in_id', length: 36, nullable: true }) sourceInventoryInId: string;
  @Column({ name: 'source_inventory_in_entry_id', length: 36, nullable: true }) sourceInventoryInEntryId: string;
  @Column({ name: 'source_order_id', length: 36 }) sourceOrderId: string;
  @Column({ name: 'source_order_entry_id', length: 36 }) sourceOrderEntryId: string;
  @Column({ name: 'source_request_id', length: 36, nullable: true }) sourceRequestId: string;
  @Column({ name: 'source_request_entry_id', length: 36, nullable: true }) sourceRequestEntryId: string;
  @Column({ name: 'material_id', length: 36 }) materialId: string;
  @Column({ name: 'material_code', length: 50 }) materialCode: string;
  @Column({ name: 'material_name', length: 200 }) materialName: string;
  @Column({ name: 'material_model', length: 200, nullable: true }) materialModel: string;
  @Column({ name: 'unit_id', length: 36 }) unitId: string;
  @Column({ name: 'unit_code', length: 50, nullable: true }) unitCode: string;
  @Column({ name: 'unit_name', length: 50, nullable: true }) unitName: string;
  @Column({ name: 'acceptance_qty', type: 'decimal', precision: 18, scale: 4 }) acceptanceQty: number;
  @Column({ name: 'passed_qty', type: 'decimal', precision: 18, scale: 4 }) passedQty: number;
  @Column({ name: 'failed_qty', type: 'decimal', precision: 18, scale: 4, default: 0 }) failedQty: number;
  @Column({ name: 'out_requested_qty', type: 'decimal', precision: 18, scale: 4, default: 0 }) outRequestedQty: number;
  @Column({ name: 'asset_card_qty', type: 'decimal', precision: 18, scale: 4, default: 0 }) assetCardQty: number;
  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 4 }) unitPrice: number;
  @Column({ name: 'tax_rate', type: 'decimal', precision: 9, scale: 4, default: 0 }) taxRate: number;
  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 }) amount: number;
  @Column({ name: 'tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) taxAmount: number;
  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) totalAmount: number;
  @Column({ name: 'asset_category_code', length: 50 }) assetCategoryCode: string;
  @Column({ name: 'department_id', length: 36, nullable: true }) departmentId: string;
  @Column({ name: 'custodian_id', length: 36, nullable: true }) custodianId: string;
  @Column({ length: 200, nullable: true }) location: string;
  @Column({ name: 'lot_no', length: 100, nullable: true }) lotNo: string;
  @Column({ length: 500, nullable: true }) remark: string;
}
