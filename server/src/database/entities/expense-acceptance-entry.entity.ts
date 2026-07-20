import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ExpenseAcceptance } from './expense-acceptance.entity';

@Entity('biz_expense_acceptance_entry')
@Index('UQ_expense_acceptance_entry_line', ['expenseAcceptanceId', 'lineNo'], { unique: true })
@Index('IDX_expense_acceptance_entry_receive', ['sourceReceiveNoticeEntryId'])
export class ExpenseAcceptanceEntry extends BaseEntity {
  @Column({ name: 'expense_acceptance_id', type: 'uniqueidentifier' })
  expenseAcceptanceId: string;

  @ManyToOne(() => ExpenseAcceptance, (acceptance) => acceptance.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'expense_acceptance_id' })
  expenseAcceptance: ExpenseAcceptance;

  @Column({ name: 'line_no', type: 'int' })
  lineNo: number;

  @Column({ name: 'source_receive_notice_id', length: 36 })
  sourceReceiveNoticeId: string;

  @Column({ name: 'source_receive_notice_entry_id', length: 36 })
  sourceReceiveNoticeEntryId: string;

  @Column({ name: 'source_order_id', length: 36 })
  sourceOrderId: string;

  @Column({ name: 'source_order_entry_id', length: 36 })
  sourceOrderEntryId: string;

  @Column({ name: 'source_request_id', length: 36, nullable: true })
  sourceRequestId: string;

  @Column({ name: 'source_request_entry_id', length: 36, nullable: true })
  sourceRequestEntryId: string;

  @Column({ name: 'expense_item_code', length: 50, nullable: true })
  expenseItemCode: string;

  @Column({ name: 'expense_item_name', length: 200 })
  expenseItemName: string;

  @Column({ name: 'material_id', length: 36, nullable: true })
  materialId: string;

  @Column({ name: 'material_code', length: 50, nullable: true })
  materialCode: string;

  @Column({ name: 'material_name', length: 200, nullable: true })
  materialName: string;

  @Column({ name: 'material_model', length: 200, nullable: true })
  materialModel: string;

  @Column({ name: 'unit_id', length: 36, nullable: true })
  unitId: string;

  @Column({ name: 'unit_code', length: 50, nullable: true })
  unitCode: string;

  @Column({ name: 'unit_name', length: 50, nullable: true })
  unitName: string;

  @Column({ name: 'acceptance_qty', type: 'decimal', precision: 18, scale: 4 })
  acceptanceQty: number;

  @Column({ name: 'unit_price', type: 'decimal', precision: 18, scale: 4 })
  unitPrice: number;

  @Column({ name: 'tax_rate', type: 'decimal', precision: 9, scale: 4, default: 0 })
  taxRate: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  amount: number;

  @Column({ name: 'tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  taxAmount: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ name: 'department_id', length: 36, nullable: true })
  departmentId: string;

  @Column({ length: 500, nullable: true })
  remark: string;
}
