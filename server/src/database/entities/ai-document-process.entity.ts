import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('ai_document_process')
export class AiDocumentProcess extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'process_no', length: 50, comment: '处理编号' })
  processNo: string;

  @Column({ name: 'document_id', length: 36, nullable: true, comment: '文档ID' })
  documentId: string;

  @Column({ name: 'file_name', length: 255, comment: '文件名' })
  fileName: string;

  @Column({ name: 'process_type', length: 50, comment: '处理类型: parse-解析 summarize-总结 correct-纠错 translate-翻译' })
  processType: string;

  @Column({ type: 'text', comment: '原始内容' })
  originalContent: string;

  @Column({ type: 'text', comment: '处理结果' })
  resultContent: string;

  @Column({ type: 'text', nullable: true, comment: '错误信息' })
  errors: string;

  @Column({ type: 'int', default: 0, comment: '状态: 0-处理中 1-已完成 2-失败' })
  status: number;

  @Column({ type: 'int', default: 0, comment: '处理耗时(毫秒)' })
  duration: number;

  @Column({ name: 'processed_by', length: 50, comment: '处理人' })
  processedBy: string;

  @Column({ name: 'processed_at', type: 'datetime', nullable: true, comment: '处理时间' })
  processedAt: Date;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}