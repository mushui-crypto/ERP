import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('fin_voucher')
export class AccountingVoucher extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'voucher_no', length: 50, comment: '凭证编号' })
  voucherNo: string;

  @Column({ name: 'voucher_date', type: 'datetime', comment: '凭证日期' })
  voucherDate: Date;

  @Column({ length: 20, comment: '会计期间, 如2026-07' })
  period: string;

  @Column({ name: 'voucher_type', type: 'int', comment: '凭证类型: 1-记账凭证 2-收款凭证 3-付款凭证 4-转账凭证' })
  voucherType: number;

  @Column({ name: 'debit_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '借方金额' })
  debitAmount: number;

  @Column({ name: 'credit_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '贷方金额' })
  creditAmount: number;

  @Column({ name: 'attachment_count', type: 'int', default: 0, comment: '附件数量' })
  attachmentCount: number;

  @Column({ type: 'int', default: 0, comment: '状态: 0-草稿 1-已审核 2-已过账' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
