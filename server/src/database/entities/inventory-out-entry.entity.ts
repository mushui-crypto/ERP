import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { InventoryOut } from './inventory-out.entity';

@Entity('inventory_out_entry')
@Index('UQ_inventory_out_entry_line', ['inventoryOutId', 'lineNo'], { unique: true })
@Index('UQ_inventory_out_entry_request', ['sourceAssetOutRequestEntryId'], { unique: true, where: 'source_asset_out_request_entry_id IS NOT NULL' })
export class InventoryOutEntry extends BaseEntity {
  @Column({ name: 'inventory_out_id', type: 'uniqueidentifier' }) inventoryOutId: string;
  @ManyToOne(() => InventoryOut, (out) => out.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'inventory_out_id' }) inventoryOut: InventoryOut;
  @Column({ name: 'line_no', type: 'int' }) lineNo: number;
  @Column({ name: 'warehouse_id', length: 36 }) warehouseId: string;
  @Column({ name: 'material_id', length: 36 }) materialId: string;
  @Column({ name: 'material_code', length: 50 }) materialCode: string;
  @Column({ name: 'material_name', length: 200 }) materialName: string;
  @Column({ name: 'material_model', length: 200, nullable: true }) materialModel: string;
  @Column({ name: 'unit_id', length: 36 }) unitId: string;
  @Column({ name: 'unit_code', length: 50, nullable: true }) unitCode: string;
  @Column({ name: 'unit_name', length: 50, nullable: true }) unitName: string;
  @Column({ type: 'decimal', precision: 18, scale: 4 }) quantity: number;
  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 4 }) unitPrice: number;
  @Column({ type: 'decimal', precision: 18, scale: 2 }) amount: number;
  @Column({ name: 'lot_no', length: 100, nullable: true }) lotNo: string;
  @Column({ name: 'source_asset_out_request_entry_id', length: 36, nullable: true }) sourceAssetOutRequestEntryId: string;
  @Column({ name: 'source_asset_acceptance_id', length: 36, nullable: true }) sourceAssetAcceptanceId: string;
  @Column({ name: 'source_asset_acceptance_entry_id', length: 36, nullable: true }) sourceAssetAcceptanceEntryId: string;
  @Column({ name: 'source_inventory_in_entry_id', length: 36, nullable: true }) sourceInventoryInEntryId: string;
  @Column({ name: 'source_order_id', length: 36, nullable: true }) sourceOrderId: string;
  @Column({ name: 'source_order_entry_id', length: 36, nullable: true }) sourceOrderEntryId: string;
  @Column({ name: 'source_request_id', length: 36, nullable: true }) sourceRequestId: string;
  @Column({ name: 'source_request_entry_id', length: 36, nullable: true }) sourceRequestEntryId: string;
  @Column({ name: 'asset_category_code', length: 50, nullable: true }) assetCategoryCode: string;
  @Column({ name: 'department_id', length: 36, nullable: true }) departmentId: string;
  @Column({ name: 'custodian_id', length: 36, nullable: true }) custodianId: string;
  @Column({ length: 200, nullable: true }) location: string;
  @Column({ name: 'inventory_posting_id', length: 36, nullable: true }) inventoryPostingId: string;
}
