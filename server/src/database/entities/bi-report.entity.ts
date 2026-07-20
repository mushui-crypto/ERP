import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_bi_report')
export class BiReport extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'report_code', length: 50, comment: '报表编码' })
  reportCode: string;

  @Column({ name: 'report_name', length: 100, comment: '报表名称' })
  reportName: string;

  @Column({ name: 'report_type', type: 'int', comment: '报表类型: 1-销售分析 2-生产分析 3-质量分析 4-库存分析 5-财务分析 6-自定义' })
  reportType: number;

  @Column({ name: 'data_source', length: 200, nullable: true, comment: '数据源配置' })
  dataSource: string;

  @Column({ name: 'chart_type', type: 'int', default: 1, comment: '图表类型: 1-表格 2-柱状图 3-折线图 4-饼图 5-组合' })
  chartType: number;

  @Column({ type: 'text', nullable: true, comment: 'JSON配置' })
  config: string;

  @Column({ name: 'is_shared',  default: 0, comment: '是否共享' })
  isShared: number;

  @Column({ name: 'creator_id', length: 36, nullable: true, comment: '创建人ID' })
  creatorId: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
