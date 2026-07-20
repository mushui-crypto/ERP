import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('biz_inventory_posting')
@Index('UQ_biz_inventory_posting_source_entry', ['sourceType', 'sourceEntryId'], { unique: true })
export class InventoryPosting extends BaseEntity {
  @Column({ name: 'source_type', length: 50, comment: '过账来源类型' })
  sourceType: string;

  @Column({ name: 'source_id', length: 36, comment: '来源单据表头ID' })
  sourceId: string;

  @Column({ name: 'source_entry_id', length: 36, comment: '来源单据明细ID，幂等键' })
  sourceEntryId: string;

  @Column({ name: 'inventory_id', length: 36, comment: '库存记录ID' })
  inventoryId: string;

  @Column({ name: 'warehouse_id', length: 36, comment: '仓库ID' })
  warehouseId: string;

  @Column({ name: 'material_id', length: 36, comment: '物料ID' })
  materialId: string;

  @Column({ name: 'batch_no', length: 100, default: '', comment: '批次号，空批次统一为空字符串' })
  batchNo: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, comment: '过账数量' })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, comment: '未税入库成本金额' })
  amount: number;

  @Column({ name: 'posted_at', type: 'datetime', comment: '过账时间' })
  postedAt: Date;
}
