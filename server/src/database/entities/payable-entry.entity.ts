import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Payable } from './payable.entity';

@Entity('fin_payable_entry')
@Index('UQ_fin_payable_entry_header_line', ['payableId', 'lineNo'], { unique: true })
@Index('UQ_fin_payable_entry_inventory_in_entry', ['inventoryInEntryId'], { unique: true })
@Index('IDX_fin_payable_entry_order_entry', ['sourceOrderEntryId'])
@Index('IDX_fin_payable_entry_request_entry', ['sourceRequestEntryId'])
export class PayableEntry extends BaseEntity {
  @Column({ name: 'payable_id', type: 'uniqueidentifier', comment: '暂估应付表头ID' })
  payableId: string;

  @ManyToOne(() => Payable, (payable) => payable.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payable_id' })
  payable: Payable;

  @Column({ name: 'line_no', type: 'int', comment: '行号' })
  lineNo: number;

  @Column({ name: 'inventory_in_entry_id', length: 36, comment: '来源采购入库明细ID' })
  inventoryInEntryId: string;

  @Column({ name: 'source_receive_notice_entry_id', length: 36, comment: '来源收料通知明细ID' })
  sourceReceiveNoticeEntryId: string;

  @Column({ name: 'source_order_entry_id', length: 36, comment: '来源采购订单明细ID' })
  sourceOrderEntryId: string;

  @Column({ name: 'source_request_entry_id', length: 36, nullable: true, comment: '来源采购申请明细ID；手工订单可为空' })
  sourceRequestEntryId: string;

  @Column({ name: 'material_id', length: 36, comment: '物料ID快照' })
  materialId: string;

  @Column({ name: 'material_code', length: 50, comment: '物料编码快照' })
  materialCode: string;

  @Column({ name: 'material_name', length: 200, comment: '物料名称快照' })
  materialName: string;

  @Column({ name: 'material_model', length: 200, nullable: true, comment: '规格型号快照' })
  materialModel: string;

  @Column({ name: 'unit_id', length: 36, comment: '计量单位ID快照' })
  unitId: string;

  @Column({ name: 'unit_code', length: 50, nullable: true, comment: '计量单位编码快照' })
  unitCode: string;

  @Column({ name: 'unit_name', length: 50, nullable: true, comment: '计量单位名称快照' })
  unitName: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, comment: '本次入库数量' })
  quantity: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 4, comment: '来源采购订单单价' })
  unitPrice: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 9, scale: 4, default: 0, comment: '来源采购订单税率' })
  taxRate: number;

  @Column({ name: 'untaxed_amount', type: 'decimal', precision: 18, scale: 2, comment: '未税金额，按采购入库明细舍入' })
  untaxedAmount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 18, scale: 2, comment: '税额，按采购入库明细舍入' })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2, comment: '价税合计，按采购入库明细舍入' })
  totalAmount: number;
}
