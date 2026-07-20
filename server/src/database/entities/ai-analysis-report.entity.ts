import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('ai_analysis_report')
export class AiAnalysisReport extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'report_no', length: 50, comment: '报告编号' })
  reportNo: string;

  @Column({ name: 'report_type', length: 50, comment: '报告类型: production-生产分析 quality-质量分析 cost-成本分析 inventory-库存分析 finance-财务分析 hr-人力分析' })
  reportType: string;

  @Column({ name: 'report_name', length: 200, comment: '报告名称' })
  reportName: string;

  @Column({ name: 'period_type', length: 20, comment: '周期类型: daily-日报 weekly-周报 monthly-月报 quarterly-季报 yearly-年报' })
  periodType: string;

  @Column({ name: 'period_start', type: 'datetime', comment: '周期开始' })
  periodStart: Date;

  @Column({ name: 'period_end', type: 'datetime', comment: '周期结束' })
  periodEnd: Date;

  @Column({ type: 'text', comment: '报告摘要' })
  summary: string;

  @Column({ type: 'text', comment: '报告内容(JSON)' })
  content: string;

  @Column({ type: 'text', nullable: true, comment: '可视化配置(JSON)' })
  visualization: string;

  @Column({ type: 'int', default: 0, comment: '状态: 0-生成中 1-已完成 2-失败' })
  status: number;

  @Column({ name: 'generated_by', length: 50, comment: '生成人' })
  generatedBy: string;

  @Column({ name: 'generated_at', type: 'datetime', nullable: true, comment: '生成时间' })
  generatedAt: Date;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}