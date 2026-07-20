import { Entity, Column } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('ai_risk_alert')
export class RiskAlert extends BaseEntity {
  @Column({ name: 'alert_type', type: 'int', comment: '预警类型: 1-缺料 2-积压 3-质量异常 4-成本波动 5-人力冗余 6-人力短缺' })
  alertType: number;

  @Column({ name: 'alert_level', type: 'int', default: 2, comment: '预警级别: 1-高 2-中 3-低' })
  alertLevel: number;

  @Column({ length: 200, comment: '预警标题' })
  title: string;

  @Column({ type: 'text', comment: '预警描述' })
  description: string;

  @Column({ name: 'source_type', length: 50, nullable: true, comment: '来源类型' })
  sourceType: string;

  @Column({ name: 'source_id', length: 36, nullable: true, comment: '来源ID' })
  sourceId: string;

  @Column({ type: 'text', nullable: true, comment: '处理建议' })
  suggestion: string;

  @Column({ type: 'int', default: 0, comment: '状态: 0-未处理 1-已处理 2-已忽略' })
  status: number;

  @Column({ name: 'handled_by', length: 50, nullable: true, comment: '处理人' })
  handledBy: string;

  @Column({ name: 'handled_at', type: 'datetime', nullable: true, comment: '处理时间' })
  handledAt: Date;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
