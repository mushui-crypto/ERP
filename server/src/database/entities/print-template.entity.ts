import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('print_template')
export class PrintTemplate extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'template_code', length: 50, comment: '模板编码' })
  templateCode: string;

  @Column({ name: 'template_name', length: 200, comment: '模板名称' })
  templateName: string;

  @Column({ name: 'template_type', type: 'int', comment: '模板类型: 1-采购单 2-销售单 3-生产单 4-其他' })
  templateType: number;

  @Column({ name: 'template_content', type: 'text', comment: '模板内容' })
  templateContent: string;

  @Column({ name: 'paper_size', length: 20, default: 'A4', comment: '纸张大小' })
  paperSize: string;

  @Column({ type: 'int', default: 1, comment: '方向: 1-纵向 2-横向' })
  orientation: number;

  @Column({ type: 'int', default: 1, comment: '打印份数' })
  copies: number;

  @Column({ name: 'printer_name', length: 100, nullable: true, comment: '打印机名称' })
  printerName: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
