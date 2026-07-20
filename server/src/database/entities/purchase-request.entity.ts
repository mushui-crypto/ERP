import { Column, Entity, Index, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { PurchaseRequestEntry } from './purchase-request-entry.entity';

@Entity('purchase_request')
export class PurchaseRequest extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'request_no', length: 50, comment: '采购申请单号' })
  requestNo: string;

  @Column({ name: 'bill_type', length: 30, default: 'STANDARD_PURCHASE', comment: '单据类型' })
  billType: string;

  @Column({ name: 'business_type', length: 30, default: 'STANDARD', comment: '业务类型' })
  businessType: string;

  @Column({ name: 'external_source_type', length: 30, nullable: true })
  externalSourceType: string;

  @Column({ name: 'external_source_id', length: 100, nullable: true })
  externalSourceId: string;

  @Column({ name: 'external_source_no', length: 100, nullable: true })
  externalSourceNo: string;

  @Column({ name: 'import_payload_hash', length: 64, nullable: true })
  importPayloadHash: string;

  @Column({ name: 'org_id', length: 36, comment: '申请组织ID/FApplicationOrgId' })
  orgId: string;

  @Column({ name: 'department_id', length: 36, nullable: true, comment: '申请部门ID/FApplicationDeptId' })
  departmentId: string;

  @Column({ name: 'applicant_id', length: 36, nullable: true, comment: '申请人ID/FApplicantId' })
  applicantId: string;

  @Column({ name: 'applicant_name', length: 50, nullable: true, comment: '申请人姓名' })
  applicantName: string;

  @Column({ name: 'request_type', length: 30, default: 'STANDARD', comment: '申请类型/FRequestType；P0仅标准采购' })
  requestType: string;

  @Column({ name: 'request_date', type: 'datetime', comment: '申请日期/FApplicationDate' })
  requestDate: Date;

  @Column({ type: 'int', default: 0, comment: '状态: 0草稿 1待审核 2已批准 3已全部下单 4已取消 5已关闭 6已驳回' })
  status: number;

  @Column({ name: 'reason', length: 500, nullable: true, comment: '申请原因' })
  reason: string;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;

  @OneToMany(() => PurchaseRequestEntry, (entry) => entry.purchaseRequest, {
    cascade: false,
  })
  entries: PurchaseRequestEntry[];

  // 以下字段仅用于兼容历史单行数据和旧接口，新业务以 entries 为准。
  @Column({ name: 'material_id', length: 36, nullable: true, comment: '兼容字段：首行物料ID' })
  materialId: string;

  @Column({ name: 'material_code', length: 50, nullable: true, comment: '兼容字段：首行物料编码' })
  materialCode: string;

  @Column({ name: 'material_name', length: 200, nullable: true, comment: '兼容字段：首行物料名称' })
  materialName: string;

  @Column({ name: 'unit_id', length: 36, nullable: true, comment: '兼容字段：首行单位ID' })
  unitId: string;

  @Column({ name: 'unit_code', length: 50, nullable: true, comment: '兼容字段：首行单位编码' })
  unitCode: string;

  @Column({ name: 'unit_name', length: 50, nullable: true, comment: '兼容字段：首行单位名称' })
  unitName: string;

  @Column({ type: 'decimal', precision: 18, scale: 4, nullable: true, comment: '兼容字段：首行申请数量' })
  quantity: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0, comment: '兼容字段：首行已采购数量' })
  purchasedQty: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0, comment: '兼容字段：首行预估单价' })
  estimatedPrice: number;

  @Column({ type: 'decimal', precision: 18, scale: 4, default: 0, comment: '兼容字段：首行预估金额' })
  estimatedAmount: number;

  @Column({ name: 'required_date', type: 'datetime', nullable: true, comment: '兼容字段：首行需求日期' })
  requiredDate: Date;

  @Column({ name: 'supplier_id', length: 36, nullable: true, comment: '兼容字段：首行建议供应商ID' })
  supplierId: string;

  @Column({ name: 'supplier_code', length: 50, nullable: true, comment: '兼容字段：首行建议供应商编码' })
  supplierCode: string;

  @Column({ name: 'supplier_name', length: 200, nullable: true, comment: '兼容字段：首行建议供应商名称' })
  supplierName: string;

  @Column({ name: 'warehouse_id', length: 36, nullable: true, comment: '兼容字段：首行仓库ID' })
  warehouseId: string;

  @Column({ name: 'source_id', length: 36, nullable: true, comment: '历史来源单据ID（不用于订单反向覆盖）' })
  sourceId: string;

  @Column({ name: 'source_no', length: 50, nullable: true, comment: '历史来源单据号（不用于订单反向覆盖）' })
  sourceNo: string;
}
