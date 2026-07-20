import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_barcode_rule')
export class BarcodeRule extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'rule_code', length: 50, comment: '规则编码' })
  ruleCode: string;

  @Column({ name: 'rule_name', length: 100, comment: '规则名称' })
  ruleName: string;

  @Column({ name: 'rule_type', type: 'int', comment: '规则类型: 1-物料条码 2-批次条码 3-序列号 4-库位条码 5-单据条码' })
  ruleType: number;

  @Column({ length: 20, nullable: true, comment: '前缀' })
  prefix: string;

  @Column({ name: 'rule_pattern', length: 200, comment: '条码生成规则' })
  rulePattern: string;

  @Column({ name: 'barcode_type', type: 'int', default: 1, comment: '条码类型: 1-Code128 2-QRCode 3-EAN13 4-Code39' })
  barcodeType: number;

  @Column({ type: 'int', default: 0, comment: '条码长度, 0表示不限制' })
  length: number;

  @Column({ name: 'is_auto_gen',  default: 1, comment: '是否自动生成' })
  isAutoGen: number;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
