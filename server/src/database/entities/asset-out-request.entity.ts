import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { AssetOutRequestEntry } from './asset-out-request-entry.entity';

@Entity('biz_asset_out_request')
@Index('UQ_asset_out_request_idempotency', ['idempotencyKey'], { unique: true })
@Index('UQ_asset_out_request_acceptance', ['sourceAssetAcceptanceId'], { unique: true, where: 'status <> 4' })
export class AssetOutRequest extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'request_no', length: 50 }) requestNo: string;
  @Column({ name: 'idempotency_key', length: 100 }) idempotencyKey: string;
  @Column({ name: 'payload_hash', length: 64 }) payloadHash: string;
  @Column({ name: 'source_asset_acceptance_id', length: 36 }) sourceAssetAcceptanceId: string;
  @Column({ name: 'source_asset_acceptance_no', length: 50 }) sourceAssetAcceptanceNo: string;
  @Column({ name: 'org_id', length: 36 }) orgId: string;
  @Column({ name: 'warehouse_id', length: 36 }) warehouseId: string;
  @Column({ name: 'department_id', length: 36, nullable: true }) departmentId: string;
  @Column({ name: 'applicant_id', length: 36, nullable: true }) applicantId: string;
  @Column({ name: 'request_date', type: 'datetime' }) requestDate: Date;
  @Column({ type: 'int', default: 0 }) status: number;
  @Column({ name: 'approved_at', type: 'datetime', nullable: true }) approvedAt: Date;
  @Column({ name: 'approved_by', length: 50, nullable: true }) approvedBy: string;
  @Column({ name: 'inventory_out_id', length: 36, nullable: true }) inventoryOutId: string;
  @Column({ name: 'inventory_out_no', length: 50, nullable: true }) inventoryOutNo: string;
  @Column({ length: 1000, nullable: true }) remark: string;
  @OneToMany(() => AssetOutRequestEntry, (entry) => entry.assetOutRequest, { cascade: false })
  entries: AssetOutRequestEntry[];
}
