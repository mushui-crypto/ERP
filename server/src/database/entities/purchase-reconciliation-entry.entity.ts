import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchaseReconciliation } from './purchase-reconciliation.entity';

@Entity('biz_purchase_reconciliation_entry')
@Index('UQ_purchase_reconciliation_entry_line', ['purchaseReconciliationId', 'lineNo'], { unique: true })
@Index('IDX_purchase_reconciliation_entry_business', ['businessSourceType', 'businessSourceEntryId'])
@Index('IDX_purchase_reconciliation_entry_order', ['sourceOrderEntryId'])
export class PurchaseReconciliationEntry extends BaseEntity {
  @Column({ name: 'purchase_reconciliation_id', type: 'uniqueidentifier' }) purchaseReconciliationId: string;
  @ManyToOne(() => PurchaseReconciliation, (header) => header.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_reconciliation_id' }) purchaseReconciliation: PurchaseReconciliation;
  @Column({ name: 'line_no', type: 'int' }) lineNo: number;
  @Column({ name: 'business_source_type', length: 30 }) businessSourceType: string;
  @Column({ name: 'business_source_id', length: 36 }) businessSourceId: string;
  @Column({ name: 'business_source_no', type: 'nvarchar', length: 50 }) businessSourceNo: string;
  @Column({ name: 'business_source_entry_id', length: 36 }) businessSourceEntryId: string;
  @Column({ name: 'business_date', type: 'datetime' }) businessDate: Date;
  @Column({ name: 'source_order_id', length: 36 }) sourceOrderId: string;
  @Column({ name: 'source_order_no', type: 'nvarchar', length: 50 }) sourceOrderNo: string;
  @Column({ name: 'source_order_entry_id', length: 36 }) sourceOrderEntryId: string;
  @Column({ name: 'source_request_id', length: 36, nullable: true }) sourceRequestId: string;
  @Column({ name: 'source_request_entry_id', length: 36, nullable: true }) sourceRequestEntryId: string;
  @Column({ name: 'payable_id', length: 36, nullable: true }) payableId: string;
  @Column({ name: 'payable_no', type: 'nvarchar', length: 50, nullable: true }) payableNo: string;
  @Column({ name: 'payable_entry_id', length: 36, nullable: true }) payableEntryId: string;
  @Column({ name: 'payable_type', length: 30, nullable: true }) payableType: string;
  @Column({ name: 'expense_item_code', length: 50, nullable: true }) expenseItemCode: string;
  @Column({ name: 'expense_item_name', type: 'nvarchar', length: 200, nullable: true }) expenseItemName: string;
  @Column({ name: 'material_id', length: 36, nullable: true }) materialId: string;
  @Column({ name: 'material_code', length: 50, nullable: true }) materialCode: string;
  @Column({ name: 'material_name', type: 'nvarchar', length: 200, nullable: true }) materialName: string;
  @Column({ name: 'material_model', type: 'nvarchar', length: 200, nullable: true }) materialModel: string;
  @Column({ name: 'unit_id', length: 36, nullable: true }) unitId: string;
  @Column({ name: 'unit_code', length: 50, nullable: true }) unitCode: string;
  @Column({ name: 'unit_name', type: 'nvarchar', length: 50, nullable: true }) unitName: string;
  @Column({ name: 'warehouse_id', length: 36, nullable: true }) warehouseId: string;
  @Column({ name: 'business_qty', type: 'decimal', precision: 18, scale: 4 }) businessQty: number;
  @Column({ name: 'business_unit_price', type: 'decimal', precision: 18, scale: 4 }) businessUnitPrice: number;
  @Column({ name: 'business_tax_rate', type: 'decimal', precision: 9, scale: 4, default: 0 }) businessTaxRate: number;
  @Column({ name: 'business_untaxed_amount', type: 'decimal', precision: 18, scale: 2 }) businessUntaxedAmount: number;
  @Column({ name: 'business_tax_amount', type: 'decimal', precision: 18, scale: 2 }) businessTaxAmount: number;
  @Column({ name: 'business_total_amount', type: 'decimal', precision: 18, scale: 2 }) businessTotalAmount: number;
  @Column({ name: 'payable_qty', type: 'decimal', precision: 18, scale: 4, default: 0 }) payableQty: number;
  @Column({ name: 'payable_unit_price', type: 'decimal', precision: 18, scale: 4, default: 0 }) payableUnitPrice: number;
  @Column({ name: 'payable_tax_rate', type: 'decimal', precision: 9, scale: 4, default: 0 }) payableTaxRate: number;
  @Column({ name: 'payable_untaxed_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) payableUntaxedAmount: number;
  @Column({ name: 'payable_tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) payableTaxAmount: number;
  @Column({ name: 'payable_total_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) payableTotalAmount: number;
  @Column({ name: 'confirmed_qty', type: 'decimal', precision: 18, scale: 4, nullable: true }) confirmedQty: number;
  @Column({ name: 'confirmed_unit_price', type: 'decimal', precision: 18, scale: 4, nullable: true }) confirmedUnitPrice: number;
  @Column({ name: 'confirmed_untaxed_amount', type: 'decimal', precision: 18, scale: 2, nullable: true }) confirmedUntaxedAmount: number;
  @Column({ name: 'confirmed_tax_amount', type: 'decimal', precision: 18, scale: 2, nullable: true }) confirmedTaxAmount: number;
  @Column({ name: 'confirmed_total_amount', type: 'decimal', precision: 18, scale: 2, nullable: true }) confirmedTotalAmount: number;
  @Column({ name: 'difference_qty', type: 'decimal', precision: 18, scale: 4, default: 0 }) differenceQty: number;
  @Column({ name: 'difference_untaxed_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) differenceUntaxedAmount: number;
  @Column({ name: 'difference_tax_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) differenceTaxAmount: number;
  @Column({ name: 'difference_total_amount', type: 'decimal', precision: 18, scale: 2, default: 0 }) differenceTotalAmount: number;
  @Column({ name: 'difference_reason', type: 'nvarchar', length: 500, nullable: true }) differenceReason: string;
  @Column({ name: 'confirm_remark', type: 'nvarchar', length: 500, nullable: true }) confirmRemark: string;
}
