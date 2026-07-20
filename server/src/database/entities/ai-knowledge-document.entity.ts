import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('ai_knowledge_document')
export class AiKnowledgeDocument extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'document_no', length: 50, comment: '文档编号' })
  documentNo: string;

  @Column({ name: 'kb_id', length: 36, comment: '知识库ID' })
  kbId: string;

  @Column({ name: 'kb_code', length: 50, comment: '知识库编码' })
  kbCode: string;

  @Column({ name: 'kb_name', length: 200, comment: '知识库名称' })
  kbName: string;

  @Column({ name: 'file_name', length: 255, comment: '文件名' })
  fileName: string;

  @Column({ name: 'file_path', length: 500, comment: '文件路径' })
  filePath: string;

  @Column({ name: 'file_type', length: 50, comment: '文件类型: txt/doc/docx/pdf/xlsx/ppt/html/md' })
  fileType: string;

  @Column({ name: 'file_size', type: 'int', comment: '文件大小(字节)' })
  fileSize: number;

  @Column({ type: 'text', nullable: true, comment: '文档内容' })
  content: string;

  @Column({ type: 'text', nullable: true, comment: '文档摘要' })
  summary: string;

  @Column({ name: 'chunk_count', type: 'int', default: 0, comment: '分块数量' })
  chunkCount: number;

  @Column({ name: 'is_vectorized', type: 'int', default: 0, comment: '是否已向量化: 1-是 0-否' })
  isVectorized: number;

  @Column({ name: 'vectorized_at', type: 'datetime', nullable: true, comment: '向量化时间' })
  vectorizedAt: Date;

  @Column({ name: 'uploaded_by', length: 50, comment: '上传人' })
  uploadedBy: string;

  @Column({ name: 'is_enabled', type: 'int', default: 1, comment: '是否启用: 1-启用 0-禁用' })
  isEnabled: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}