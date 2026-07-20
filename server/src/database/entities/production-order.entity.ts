import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('biz_production_order')
export class ProductionOrder extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'order_no', length: 50, comment: '订单编号' })
  orderNo: string;

  @Column({ name: 'material_id', length: 36, comment: '物料ID' })
  materialId: string;

  @Column({ name: 'bom_id', length: 36, nullable: true, comment: 'BOMID' })
  bomId: string;

  @Column({ name: 'routing_id', length: 36, nullable: true, comment: '工艺路线ID' })
  routingId: string;

  @Column({ name: 'quantity', type: 'decimal', precision: 18, scale: 4, comment: '生产数量' })
  quantity: number;

  @Column({ name: 'completed_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '完工数量' })
  completedQty: number;

  @Column({ name: 'scrapped_qty', type: 'decimal', precision: 18, scale: 4, default: 0, comment: '报废数量' })
  scrappedQty: number;

  @Column({ name: 'planned_start_date', type: 'datetime', comment: '计划开始日期' })
  plannedStartDate: Date;

  @Column({ name: 'planned_end_date', type: 'datetime', comment: '计划结束日期' })
  plannedEndDate: Date;

  @Column({ name: 'actual_start_date', type: 'datetime', nullable: true, comment: '实际开始日期' })
  actualStartDate: Date;

  @Column({ name: 'actual_end_date', type: 'datetime', nullable: true, comment: '实际结束日期' })
  actualEndDate: Date;

  @Column({ name: 'warehouse_id', length: 36, nullable: true, comment: '仓库ID' })
  warehouseId: string;

  @Column({ type: 'int', default: 2, comment: '优先级: 1-紧急 2-正常 3-低' })
  priority: number;

  @Column({ type: 'int', default: 0, comment: '状态: 0-草稿 1-已下达 2-生产中 3-已完工 4-已关闭 5-已取消' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
