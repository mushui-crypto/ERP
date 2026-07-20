import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('bi_widget')
export class BiWidget extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'widget_code', length: 50, comment: '组件编码' })
  widgetCode: string;

  @Column({ name: 'widget_name', length: 100, comment: '组件名称' })
  widgetName: string;

  @Column({ name: 'widget_type', length: 50, comment: '组件类型: chart/table/number/card/gauge' })
  widgetType: string;

  @Column({ name: 'chart_type', length: 50, nullable: true, comment: '图表类型: line/bar/pie/area/scatter' })
  chartType: string;

  @Column({ name: 'data_source', length: 100, nullable: true, comment: '数据源' })
  dataSource: string;

  @Column({ name: 'query_config', type: 'text', nullable: true, comment: '查询配置JSON' })
  queryConfig: string;

  @Column({ name: 'visual_config', type: 'text', nullable: true, comment: '可视化配置JSON' })
  visualConfig: string;

  @Column({ name: 'refresh_interval', type: 'int', default: 60, comment: '刷新间隔(秒)' })
  refreshInterval: number;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;
}