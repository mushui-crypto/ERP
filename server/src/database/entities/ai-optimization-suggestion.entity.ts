import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('ai_optimization_suggestion')
export class AiOptimizationSuggestion extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'suggestion_no', length: 50, comment: '建议编号' })
  suggestionNo: string;

  @Column({ name: 'optimization_type', length: 50, comment: '优化类型: production-生产排产 warehouse-仓储管理 process-工艺优化 hr-人员调配' })
  optimizationType: string;

  @Column({ name: 'category', length: 50, comment: '优化类别' })
  category: string;

  @Column({ length: 200, comment: '建议标题' })
  title: string;

  @Column({ type: 'text', comment: '问题描述' })
  problem: string;

  @Column({ type: 'text', comment: '优化建议' })
  suggestion: string;

  @Column({ name: 'expected_benefit', type: 'text', nullable: true, comment: '预期收益' })
  expectedBenefit: string;

  @Column({ name: 'priority', type: 'int', default: 2, comment: '优先级: 1-高 2-中 3-低' })
  priority: number;

  @Column({ type: 'int', default: 0, comment: '状态: 0-待评估 1-已采纳 2-已实施 3-已拒绝' })
  status: number;

  @Column({ name: 'source_data', type: 'text', nullable: true, comment: '数据源(JSON)' })
  sourceData: string;

  @Column({ name: 'assessed_by', length: 50, nullable: true, comment: '评估人' })
  assessedBy: string;

  @Column({ name: 'assessed_at', type: 'datetime', nullable: true, comment: '评估时间' })
  assessedAt: Date;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}