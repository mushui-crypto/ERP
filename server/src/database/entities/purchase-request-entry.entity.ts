import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchaseRequest } from './purchase-request.entity';

@Entity('purchase_request_entry')
@Index(['purchaseRequestId', 'lineNo'], { unique: true })
export class PurchaseRequestEntry extends BaseEntity {
  @Column({ name: 'purchase_request_id', type: 'uniqueidentifier', comment: '采购申请表头ID' })
  purchaseRequestId: string;

  @ManyToOne(() => PurchaseRequest, (request) => request.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'purchase_request_id' })
  purchaseRequest: PurchaseRequest;

  @Column({ name: 'line_no', type: 'int', comment: '行号' })
  lineNo: number;

  @Column({ name: 'purchase_org_id', length: 36, comment: '采购组织ID/FPurchaseOrgId' })
  purchaseOrgId: string;

  @Column({ name: 'expense_item_code', length: 50, nullable: true, comment: '费用/服务项目文本编码' })
  expenseItemCode: string;

  @Column({ name: 'expense_item_name', length: 200, nullable: true, comment: '费用/服务项目文本名称' })
  expenseItemName: string;

  @Column({ name: 'material_id', length: 36, nullable: true, comment: '物料ID/FMaterialId；费用采购可空' })
  materialId: string;

  @Column({ name: 'material_code', length: 50, nullable: true, comment: '物料编码；费用采购可空' })
  materialCode: string;

  @Column({ name: 'material_name', length: 200, nullable: true, comment: '物料名称/FMaterialName；费用采购可空' })
  materialName: string;

  @Column({ name: 'material_model', length: 200, nullable: true, comment: '规格型号/FMaterialModel' })
  materialModel: string;

  @Column({ name: 'unit_id', length: 36, nullable: true, comment: '申请单位ID/FUnitId；费用采购可空' })
  unitId: string;

  @Column({ name: 'unit_code', length: 50, nullable: true, comment: '申请单位编码' })
  unitCode: string;

  @Column({ name: 'unit_name', length: 50, nullable: true, comment: '申请单位名称' })
  unitName: string;

  @Column({ name: 'request_qty', type: 'decimal', precision: 18, scale: 4, comment: '申请数量/FReqQty' })
  requestQty: number;

  @Column({ name: 'approve_qty', type: 'decimal', precision: 18, scale: 4, nullable: true, comment: '批准数量/FApproveQty；为空时按申请数量' })
  approveQty: number;

  @Column({ name: 'purchased_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '已下推订单数量/FOrderQty' })
  purchasedQty: number;

  @Column({ name: 'estimated_price', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '预估单价' })
  estimatedPrice: number;

  @Column({ name: 'estimated_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '预估金额' })
  estimatedAmount: number;

  @Column({ name: 'required_date', type: 'datetime', nullable: true, comment: '需求日期' })
  requiredDate: Date;

  @Column({ name: 'supplier_id', length: 36, nullable: true, comment: '建议供应商ID' })
  supplierId: string;

  @Column({ name: 'supplier_code', length: 50, nullable: true, comment: '建议供应商编码' })
  supplierCode: string;

  @Column({ name: 'supplier_name', length: 200, nullable: true, comment: '建议供应商名称' })
  supplierName: string;

  @Column({ name: 'warehouse_id', length: 36, nullable: true, comment: '建议入库仓库ID' })
  warehouseId: string;

  @Column({ name: 'contract_no', length: 100, nullable: true, comment: '合同号/FContractNo' })
  contractNo: string;

  @Column({ length: 500, nullable: true, comment: '行备注' })
  remark: string;
}
