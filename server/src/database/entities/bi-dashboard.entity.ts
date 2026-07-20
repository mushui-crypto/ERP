import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('bi_dashboard')
export class BiDashboard extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'dashboard_code', length: 50, comment: '仪表盘编码' })
  dashboardCode: string;

  @Column({ name: 'dashboard_name', length: 100, comment: '仪表盘名称' })
  dashboardName: string;

  @Column({ name: 'description', length: 500, nullable: true, comment: '仪表盘描述' })
  description: string;

  @Column({ name: 'category', length: 50, nullable: true, comment: '分类: 生产/销售/库存/财务/质量' })
  category: string;

  @Column({ name: 'layout', type: 'text', nullable: true, comment: '布局配置JSON' })
  layout: string;

  @Column({ name: 'widget_ids', length: 500, nullable: true, comment: '组件ID列表，逗号分隔' })
  widgetIds: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'int', default: 0, comment: '排序号' })
  sortOrder: number;

  @Column({ name: 'is_public', type: 'int', default: 0, comment: '是否公开: 1-公开 0-私有' })
  isPublic: number;
}