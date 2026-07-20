import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiKnowledgeBase } from '../../database/entities/ai-knowledge-base.entity';
import { AiKnowledgeDocument } from '../../database/entities/ai-knowledge-document.entity';
import { AiKnowledgeChunk } from '../../database/entities/ai-knowledge-chunk.entity';
import { createHash } from 'crypto';

@Injectable()
export class KnowledgeBaseService {
  constructor(
    @InjectRepository(AiKnowledgeBase)
    private kbRepository: Repository<AiKnowledgeBase>,
    @InjectRepository(AiKnowledgeDocument)
    private documentRepository: Repository<AiKnowledgeDocument>,
    @InjectRepository(AiKnowledgeChunk)
    private chunkRepository: Repository<AiKnowledgeChunk>,
  ) {}

  async generateKbCode(): Promise<string> {
    const now = new Date();
    const prefix = 'KB';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.kbRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async generateDocumentNo(): Promise<string> {
    const now = new Date();
    const prefix = 'KD';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.documentRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async createKnowledgeBase(data: Partial<AiKnowledgeBase>): Promise<AiKnowledgeBase> {
    const kbCode = await this.generateKbCode();
    
    const existing = await this.kbRepository.findOne({
      where: { kbCode, isDeleted: 0 },
    });
    if (existing) {
      throw new BadRequestException('知识库编码已存在');
    }

    const kb = this.kbRepository.create({
      ...data,
      kbCode,
      isEnabled: 1,
      documentCount: 0,
      vectorCount: 0,
    });
    return this.kbRepository.save(kb);
  }

  async updateKnowledgeBase(id: string, data: Partial<AiKnowledgeBase>): Promise<AiKnowledgeBase> {
    const kb = await this.kbRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!kb) throw new NotFoundException('知识库不存在');
    Object.assign(kb, data);
    return this.kbRepository.save(kb);
  }

  async deleteKnowledgeBase(id: string): Promise<void> {
    const kb = await this.kbRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!kb) throw new NotFoundException('知识库不存在');

    kb.isDeleted = 1;
    await this.kbRepository.save(kb);

    await this.documentRepository.update({ kbId: id }, { isDeleted: 1 });
    await this.chunkRepository.update({ kbId: id }, { isValid: 0 });
  }

  async findKnowledgeBases(page = 1, pageSize = 20, kbType?: string): Promise<any> {
    const query = this.kbRepository.createQueryBuilder('kb')
      .where('kb.isDeleted = 0');

    if (kbType) {
      query.andWhere('kb.kbType = :kbType', { kbType });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('kb.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findKnowledgeBaseById(id: string): Promise<AiKnowledgeBase | null> {
    return this.kbRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async uploadDocument(kbId: string, fileName: string, filePath: string, fileType: string, fileSize: number, content: string, uploadedBy: string): Promise<AiKnowledgeDocument> {
    const kb = await this.kbRepository.findOne({ where: { id: kbId, isDeleted: 0 } });
    if (!kb) throw new NotFoundException('知识库不存在');

    const documentNo = await this.generateDocumentNo();

    const document = this.documentRepository.create({
      documentNo,
      kbId,
      kbCode: kb.kbCode,
      kbName: kb.kbName,
      fileName,
      filePath,
      fileType,
      fileSize,
      content,
      summary: this.generateSummary(content),
      chunkCount: 0,
      isVectorized: 0,
      uploadedBy,
      isEnabled: 1,
    });

    const savedDocument = await this.documentRepository.save(document);

    kb.documentCount += 1;
    await this.kbRepository.save(kb);

    await this.processDocument(savedDocument);

    return savedDocument;
  }

  async processDocument(document: AiKnowledgeDocument): Promise<void> {
    if (!document.content) return;

    const chunks = this.splitText(document.content, 500, 100);
    document.chunkCount = chunks.length;
    await this.documentRepository.save(document);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const contentHash = this.generateHash(chunk);
      const vector = this.generateMockVector(384);

      await this.chunkRepository.save({
        documentId: document.id,
        documentNo: document.documentNo,
        kbId: document.kbId,
        chunkIndex: i,
        content: chunk,
        contentHash,
        vectorDim: 384,
        vectorData: JSON.stringify(vector),
        metadata: JSON.stringify({
          documentId: document.id,
          documentNo: document.documentNo,
          fileName: document.fileName,
          chunkIndex: i,
          totalChunks: chunks.length,
        }),
        isValid: 1,
      });
    }

    document.isVectorized = 1;
    document.vectorizedAt = new Date();
    await this.documentRepository.save(document);

    const kb = await this.kbRepository.findOne({ where: { id: document.kbId, isDeleted: 0 } });
    if (kb) {
      kb.vectorCount += chunks.length;
      await this.kbRepository.save(kb);
    }
  }

  splitText(text: string, chunkSize: number, overlap: number): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = start + chunkSize;
      const chunk = text.substring(start, end);
      
      if (chunk.length > 0) {
        chunks.push(chunk.trim());
      }

      start = end - overlap;
    }

    return chunks;
  }

  generateHash(text: string): string {
    return createHash('sha256').update(text).digest('hex');
  }

  generateMockVector(dim: number): number[] {
    const vector: number[] = [];
    for (let i = 0; i < dim; i++) {
      vector.push((Math.random() - 0.5) * 2);
    }
    return vector;
  }

  generateSummary(text: string): string {
    if (!text || text.length <= 200) return text;
    return text.substring(0, 200) + '...';
  }

  async findDocuments(kbId: string, page = 1, pageSize = 20): Promise<any> {
    const query = this.documentRepository.createQueryBuilder('doc')
      .where('doc.isDeleted = 0 AND doc.kbId = :kbId', { kbId });

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('doc.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findDocumentById(id: string): Promise<AiKnowledgeDocument | null> {
    return this.documentRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async deleteDocument(id: string): Promise<void> {
    const document = await this.documentRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!document) throw new NotFoundException('文档不存在');

    document.isDeleted = 1;
    await this.documentRepository.save(document);

    await this.chunkRepository.update({ documentId: id }, { isValid: 0 });

    const kb = await this.kbRepository.findOne({ where: { id: document.kbId, isDeleted: 0 } });
    if (kb) {
      kb.documentCount -= 1;
      kb.vectorCount -= document.chunkCount;
      await this.kbRepository.save(kb);
    }
  }

  async search(kbId: string, query: string, topK = 5): Promise<any[]> {
    const queryVector = this.generateMockVector(384);

    const chunks = await this.chunkRepository.find({
      where: { kbId, isValid: 1 },
      take: 100,
    });

    const results = chunks.map(chunk => {
      const chunkVector = JSON.parse(chunk.vectorData);
      const similarity = this.calculateCosineSimilarity(queryVector, chunkVector);
      return {
        ...chunk,
        similarity,
      };
    }).sort((a, b) => b.similarity - a.similarity).slice(0, topK);

    return results;
  }

  calculateCosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) return 0;

    let dotProduct = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      norm1 += vec1[i] * vec1[i];
      norm2 += vec2[i] * vec2[i];
    }

    const magnitude = Math.sqrt(norm1) * Math.sqrt(norm2);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }

  async getStatistics(): Promise<any> {
    const totalKbs = await this.kbRepository.count({ where: { isDeleted: 0 } });
    const totalDocuments = await this.documentRepository.count({ where: { isDeleted: 0 } });
    const totalVectors = await this.chunkRepository.count({ where: { isValid: 1 } });

    const kbStats = await this.kbRepository.createQueryBuilder('kb')
      .select(['kb.kbName', 'kb.documentCount', 'kb.vectorCount'])
      .where('kb.isDeleted = 0')
      .getMany();

    return {
      totalKbs,
      totalDocuments,
      totalVectors,
      kbStats,
    };
  }
}