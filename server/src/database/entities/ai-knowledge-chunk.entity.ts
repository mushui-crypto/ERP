import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('ai_knowledge_chunk')
export class AiKnowledgeChunk extends BaseEntity {
  @Column({ name: 'document_id', length: 36, comment: '文档ID' })
  documentId: string;

  @Column({ name: 'document_no', length: 50, comment: '文档编号' })
  documentNo: string;

  @Column({ name: 'kb_id', length: 36, comment: '知识库ID' })
  kbId: string;

  @Column({ name: 'chunk_index', type: 'int', comment: '分块索引' })
  chunkIndex: number;

  @Column({ type: 'text', comment: '分块内容' })
  content: string;

  @Column({ name: 'content_hash', length: 64, comment: '内容哈希' })
  contentHash: string;

  @Column({ name: 'vector_dim', type: 'int', comment: '向量维度' })
  vectorDim: number;

  @Column({ type: 'text', comment: '向量数据(JSON数组)' })
  vectorData: string;

  @Column({ name: 'metadata', type: 'text', nullable: true, comment: '元数据(JSON)' })
  metadata: string;

  @Column({ name: 'is_valid', type: 'int', default: 1, comment: '是否有效: 1-是 0-否' })
  isValid: number;
}