import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiDocumentProcess } from '../../database/entities/ai-document-process.entity';

@Injectable()
export class DocumentProcessService {
  constructor(
    @InjectRepository(AiDocumentProcess)
    private processRepository: Repository<AiDocumentProcess>,
  ) {}

  async generateProcessNo(): Promise<string> {
    const now = new Date();
    const prefix = 'DP';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.processRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async parseDocument(fileName: string, content: string, processedBy: string): Promise<AiDocumentProcess> {
    const processNo = await this.generateProcessNo();
    const startTime = Date.now();

    const process = this.processRepository.create({
      processNo,
      fileName,
      processType: 'parse',
      originalContent: content,
      resultContent: '',
      status: 0,
      processedBy,
    });

    const savedProcess = await this.processRepository.save(process);

    const result = this.parseContent(content);
    savedProcess.resultContent = JSON.stringify(result);
    savedProcess.status = 1;
    savedProcess.duration = Date.now() - startTime;
    savedProcess.processedAt = new Date();

    return this.processRepository.save(savedProcess);
  }

  parseContent(content: string): any {
    const lines = content.split('\n').filter(l => l.trim());
    
    const title = lines[0]?.trim() || '';
    const paragraphs: string[] = [];
    const tables: any[] = [];
    const lists: any[] = [];
    const keyValues: any = {};

    let currentParagraph = '';
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (!line) {
        if (currentParagraph) {
          paragraphs.push(currentParagraph.trim());
          currentParagraph = '';
        }
        continue;
      }

      if (line.startsWith('- ') || line.startsWith('* ') || line.match(/^\d+\./)) {
        if (currentParagraph) {
          paragraphs.push(currentParagraph.trim());
          currentParagraph = '';
        }
        const lastList = lists[lists.length - 1];
        if (lastList && lastList.type === this.detectListType(line)) {
          lastList.items.push(line.replace(/^[-*\d.]+\s*/, ''));
        } else {
          lists.push({
            type: this.detectListType(line),
            items: [line.replace(/^[-*\d.]+\s*/, '')],
          });
        }
      } else if (line.includes('：') || line.includes(':') || line.includes('=')) {
        const parts = line.split(/[：:=]/);
        if (parts.length >= 2) {
          keyValues[parts[0].trim()] = parts.slice(1).join(':').trim();
        }
        currentParagraph += line + '\n';
      } else if (line.includes('|')) {
        if (currentParagraph) {
          paragraphs.push(currentParagraph.trim());
          currentParagraph = '';
        }
        const lastTable = tables[tables.length - 1];
        if (lastTable && line.startsWith('|')) {
          lastTable.rows.push(line.split('|').map(c => c.trim()).filter(c => c));
        } else {
          tables.push({
            rows: [line.split('|').map(c => c.trim()).filter(c => c)],
          });
        }
      } else {
        currentParagraph += line + '\n';
      }
    }

    if (currentParagraph) {
      paragraphs.push(currentParagraph.trim());
    }

    return {
      title,
      paragraphCount: paragraphs.length,
      tableCount: tables.length,
      listCount: lists.length,
      fieldCount: Object.keys(keyValues).length,
      paragraphs,
      tables,
      lists,
      keyValues,
    };
  }

  detectListType(line: string): string {
    if (line.startsWith('- ') || line.startsWith('* ')) {
      return 'unordered';
    }
    if (line.match(/^\d+\./)) {
      return 'ordered';
    }
    return 'other';
  }

  async summarizeDocument(fileName: string, content: string, processedBy: string, maxLength = 500): Promise<AiDocumentProcess> {
    const processNo = await this.generateProcessNo();
    const startTime = Date.now();

    const process = this.processRepository.create({
      processNo,
      fileName,
      processType: 'summarize',
      originalContent: content,
      resultContent: '',
      status: 0,
      processedBy,
    });

    const savedProcess = await this.processRepository.save(process);

    const summary = this.summarizeContent(content, maxLength);
    savedProcess.resultContent = summary;
    savedProcess.status = 1;
    savedProcess.duration = Date.now() - startTime;
    savedProcess.processedAt = new Date();

    return this.processRepository.save(savedProcess);
  }

  summarizeContent(content: string, maxLength: number): string {
    const paragraphs = content.split('\n').filter(p => p.trim()).slice(0, 10);
    
    const sentences: string[] = [];
    for (const paragraph of paragraphs) {
      const paraSentences = paragraph.split(/[。！？.!?]/).filter(s => s.trim());
      sentences.push(...paraSentences);
    }

    let summary = sentences.slice(0, 5).join('。') + '。';
    
    if (summary.length > maxLength) {
      summary = summary.substring(0, maxLength - 3) + '...';
    }

    const keywords = this.extractKeywords(content);
    const keywordStr = keywords.slice(0, 5).join('、');

    return `【文档摘要】\n${summary}\n\n【关键词】${keywordStr}`;
  }

  extractKeywords(content: string): string[] {
    const keywordList = [
      '生产', '工艺', '质量', '成本', '库存', '采购', '销售', '员工', '绩效', '客户',
      '计划', '订单', '物料', '设备', '效率', '安全', '管理', '流程', '优化', '改进',
    ];

    const found: string[] = [];
    for (const keyword of keywordList) {
      if (content.includes(keyword)) {
        found.push(keyword);
      }
    }

    return found;
  }

  async correctDocument(fileName: string, content: string, processedBy: string): Promise<AiDocumentProcess> {
    const processNo = await this.generateProcessNo();
    const startTime = Date.now();

    const process = this.processRepository.create({
      processNo,
      fileName,
      processType: 'correct',
      originalContent: content,
      resultContent: '',
      status: 0,
      processedBy,
    });

    const savedProcess = await this.processRepository.save(process);

    const result = this.correctContent(content);
    savedProcess.resultContent = JSON.stringify(result);
    savedProcess.status = 1;
    savedProcess.duration = Date.now() - startTime;
    savedProcess.processedAt = new Date();

    return this.processRepository.save(savedProcess);
  }

  correctContent(content: string): any {
    const errors: any[] = [];
    let correctedContent = content;

    const errorPatterns = [
      { pattern: /(生产|制造)(率|力)/g, expected: '产能', type: '术语' },
      { pattern: /(库存)(量|额)/g, expected: '库存', type: '术语' },
      { pattern: /(合格)(率|度)/g, expected: '合格率', type: '术语' },
      { pattern: /(成本)(费)/g, expected: '成本', type: '术语' },
      { pattern: /(销售)(量|额)/g, expected: '销售额', type: '术语' },
      { pattern: /(采购)(量|额)/g, expected: '采购量', type: '术语' },
      { pattern: /(员工)(数|量)/g, expected: '员工人数', type: '术语' },
      { pattern: /(绩效)(分|评)/g, expected: '绩效评分', type: '术语' },
      { pattern: /(客户)(数|量)/g, expected: '客户数量', type: '术语' },
      { pattern: /(订单)(数|量)/g, expected: '订单数量', type: '术语' },
    ];

    for (const { pattern, expected, type } of errorPatterns) {
      const matches = content.match(pattern);
      if (matches) {
        for (const match of matches) {
          errors.push({
            type,
            original: match,
            expected,
            position: content.indexOf(match),
          });
        }
      }
    }

    const datePattern = /(\d{4})[-/](\d{1,2})[-/](\d{1,2})/g;
    const dateMatches = content.match(datePattern);
    if (dateMatches) {
      for (const match of dateMatches) {
        if (!this.isValidDate(match)) {
          errors.push({
            type: '日期格式',
            original: match,
            expected: 'YYYY-MM-DD格式',
            position: content.indexOf(match),
          });
        }
      }
    }

    const numberPattern = /(\d{1,3})(\d{3,})/g;
    const numberMatches = content.match(numberPattern);
    if (numberMatches) {
      for (const match of numberMatches) {
        if (!match.includes(',')) {
          errors.push({
            type: '数字格式',
            original: match,
            expected: this.formatNumber(match),
            position: content.indexOf(match),
          });
        }
      }
    }

    return {
      errorCount: errors.length,
      errors,
      correctedContent,
      suggestions: errors.length > 0 
        ? '建议按照上述修正项进行修改，确保文档术语规范、格式统一。' 
        : '文档内容检查通过，未发现明显问题。',
    };
  }

  isValidDate(dateStr: string): boolean {
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
  }

  formatNumber(numStr: string): string {
    return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  async translateDocument(fileName: string, content: string, processedBy: string, targetLang = 'en'): Promise<AiDocumentProcess> {
    const processNo = await this.generateProcessNo();
    const startTime = Date.now();

    const process = this.processRepository.create({
      processNo,
      fileName,
      processType: 'translate',
      originalContent: content,
      resultContent: '',
      status: 0,
      processedBy,
    });

    const savedProcess = await this.processRepository.save(process);

    const translation = this.translateContent(content, targetLang);
    savedProcess.resultContent = translation;
    savedProcess.status = 1;
    savedProcess.duration = Date.now() - startTime;
    savedProcess.processedAt = new Date();

    return this.processRepository.save(savedProcess);
  }

  translateContent(content: string, targetLang: string): string {
    if (targetLang === 'en') {
      return `[English Translation]\nThis is a simulated translation of the document content.\n\nOriginal content length: ${content.length} characters\n\nNote: This is a mock translation. In a real implementation, this would call an external translation API.`;
    }

    return `[Translation to ${targetLang}]\nThis is a simulated translation.\n\nNote: This is a mock translation. In a real implementation, this would call an external translation API.`;
  }

  async findProcesses(page = 1, pageSize = 20, processType?: string, status?: number): Promise<any> {
    const query = this.processRepository.createQueryBuilder('p')
      .where('p.isDeleted = 0');

    if (processType) {
      query.andWhere('p.processType = :processType', { processType });
    }
    if (status !== undefined && status !== null) {
      query.andWhere('p.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('p.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findProcessById(id: string): Promise<AiDocumentProcess | null> {
    return this.processRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async deleteProcess(id: string): Promise<void> {
    const process = await this.findProcessById(id);
    if (!process) throw new NotFoundException('文档处理记录不存在');

    process.isDeleted = 1;
    await this.processRepository.save(process);
  }
}