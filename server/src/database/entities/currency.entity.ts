import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('master_currency')
export class Currency extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'currency_code', length: 10, comment: '币种编码' })
  currencyCode: string;

  @Column({ name: 'currency_name', length: 50, comment: '币种名称' })
  currencyName: string;

  @Column({ name: 'currency_symbol', length: 10, comment: '币种符号' })
  currencySymbol: string;

  @Column({ name: 'exchange_rate', type: 'decimal', precision: 18, scale: 6, default: 1, comment: '汇率' })
  exchangeRate: number;

  @Column({ name: 'is_base',  default: 0, comment: '是否本位币' })
  isBase: number;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
