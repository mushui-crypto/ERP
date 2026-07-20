import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('fin_receivable')
export class Receivable extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'receivable_no', length: 50, comment: '应收单号' })
  receivableNo: string;

  @Index()
  @Column({ name: 'customer_id', length: 36, comment: '客户ID' })
  customerId: string;

  @Column({ name: 'source_type', length: 50, comment: '来源类型, 如sales_order' })
  sourceType: string;

  @Column({ name: 'source_id', length: 36, nullable: true, comment: '来源单据ID' })
  sourceId: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, comment: '应收金额' })
  amount: number;

  @Column({ name: 'received_amount', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '已收金额' })
  receivedAmount: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, comment: '余额' })
  balance: number;

  @Column({ name: 'receivable_date', type: 'datetime', comment: '应收日期' })
  receivableDate: Date;

  @Column({ name: 'due_date', type: 'datetime', comment: '到期日期' })
  dueDate: Date;

  @Column({ length: 20, nullable: true, comment: '会计期间' })
  period: string;

  @Column({ type: 'int', default: 0, comment: '状态: 0-未结算 1-部分结算 2-已结算 3-逾期' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
