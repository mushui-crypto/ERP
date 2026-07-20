import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('crm_opportunity')
export class CrmOpportunity extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'opportunity_no', length: 50, comment: '商机编号' })
  opportunityNo: string;

  @Column({ name: 'opp_name', length: 200, comment: '商机名称' })
  oppName: string;

  @Index()
  @Column({ name: 'customer_id', length: 36, comment: '客户ID' })
  customerId: string;

  @Column({ name: 'contact_id', length: 36, nullable: true, comment: '联系人ID' })
  contactId: string;

  @Column({ type: 'int', default: 1, comment: '阶段: 1-线索 2-初步接触 3-需求确认 4-方案报价 5-谈判 6-成交 7-失败' })
  stage: number;

  @Column({ name: 'stage_id', length: 36, nullable: true, comment: '销售阶段ID' })
  stageId: string;

  @Column({ name: 'stage_name', length: 100, nullable: true, comment: '销售阶段名称' })
  stageName: string;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, comment: '商机金额' })
  amount: number;

  @Column({ name: 'expected_close_date', type: 'datetime', nullable: true, comment: '预计成交日期' })
  expectedCloseDate: Date;

  @Column({ type: 'int', default: 10, comment: '成交概率' })
  probability: number;

  @Column({ length: 50, nullable: true, comment: '商机来源' })
  source: string;

  @Column({ name: 'salesperson_id', length: 36, nullable: true, comment: '销售员ID' })
  salespersonId: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1-进行中 2-已成交 3-已失败' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
