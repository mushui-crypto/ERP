import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_barcode')
export class SysBarcode extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'barcode', length: 100, comment: '条码值' })
  barcode: string;

  @Column({ name: 'rule_id', length: 36, comment: '规则ID' })
  ruleId: string;

  @Column({ name: 'rule_code', length: 50, comment: '规则编码' })
  ruleCode: string;

  @Column({ name: 'rule_name', length: 100, comment: '规则名称' })
  ruleName: string;

  @Column({ name: 'barcode_type', type: 'int', default: 1, comment: '条码类型: 1-Code128 2-QRCode 3-EAN13 4-Code39' })
  barcodeType: number;

  @Column({ name: 'target_type', length: 50, comment: '目标类型: material-物料 batch-批次 serial-序列号 location-库位 order-订单' })
  targetType: string;

  @Column({ name: 'target_id', length: 36, nullable: true, comment: '目标ID' })
  targetId: string;

  @Column({ name: 'target_code', length: 100, nullable: true, comment: '目标编码' })
  targetCode: string;

  @Column({ name: 'target_name', length: 200, nullable: true, comment: '目标名称' })
  targetName: string;

  @Column({ name: 'batch_no', length: 50, nullable: true, comment: '批次号' })
  batchNo: string;

  @Column({ name: 'expiry_date', type: 'datetime', nullable: true, comment: '有效期' })
  expiryDate: Date;

  @Column({ type: 'int', default: 0, comment: '使用次数' })
  useCount: number;

  @Column({ type: 'int', default: 1, comment: '状态: 1-可用 0-已使用 2-作废' })
  status: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}