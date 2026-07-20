import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiConversation } from '../../database/entities/ai-conversation.entity';
import { AiKnowledgeChunk } from '../../database/entities/ai-knowledge-chunk.entity';
import { KnowledgeBaseService } from '../knowledge-base/knowledge-base.service';

@Injectable()
export class AiQaService {
  constructor(
    @InjectRepository(AiConversation)
    private conversationRepository: Repository<AiConversation>,
    @InjectRepository(AiKnowledgeChunk)
    private chunkRepository: Repository<AiKnowledgeChunk>,
    private knowledgeBaseService: KnowledgeBaseService,
  ) {}

  async generateSessionId(): Promise<string> {
    return 'SESSION_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async ask(question: string, userId: string, sessionId?: string, moduleType?: string): Promise<any> {
    if (!sessionId) {
      sessionId = await this.generateSessionId();
    }

    await this.saveMessage(sessionId, userId, 'user', question, moduleType);

    const context = await this.retrieveContext(question);
    const answer = await this.generateAnswer(question, context);

    await this.saveMessage(sessionId, userId, 'assistant', answer, moduleType);

    return {
      sessionId,
      answer,
      context,
    };
  }

  async retrieveContext(question: string): Promise<any[]> {
    const results = await this.knowledgeBaseService.search('', question, 3);
    
    const context = results.map(r => ({
      content: r.content,
      similarity: r.similarity,
      documentId: r.documentId,
      documentNo: r.documentNo,
    }));

    return context;
  }

  async generateAnswer(question: string, context: any[]): Promise<string> {
    const keywords = this.extractKeywords(question);

    if (this.isProductionQuery(keywords)) {
      return this.generateProductionAnswer(question);
    }
    if (this.isInventoryQuery(keywords)) {
      return this.generateInventoryAnswer(question);
    }
    if (this.isQualityQuery(keywords)) {
      return this.generateQualityAnswer(question);
    }
    if (this.isHRQuery(keywords)) {
      return this.generateHRAnswer(question);
    }
    if (this.isFinanceQuery(keywords)) {
      return this.generateFinanceAnswer(question);
    }

    if (context.length > 0) {
      const contextText = context.map(c => c.content).join('\n');
      return `根据知识库内容，${question}\n\n相关信息：\n${contextText}\n\n建议您提供更具体的查询条件，以便我为您提供更准确的回答。`;
    }

    return `我理解您的问题：${question}\n\n目前系统中没有找到直接相关的信息。您可以尝试以下方式获取更多帮助：\n1. 提供更具体的查询条件\n2. 上传相关文档到知识库\n3. 使用系统提供的统计分析功能\n\n如果您需要查询特定模块的数据，请明确说明模块名称（如：生产、库存、质量、人力、财务等）。`;
  }

  extractKeywords(question: string): string[] {
    const keywords: string[] = [];
    
    const productionKeywords = ['生产', '产量', '工单', '工艺', '制造', '车间', '产能'];
    const inventoryKeywords = ['库存', '物料', '仓库', '库存数量', '库存金额', '出入库'];
    const qualityKeywords = ['质量', '检验', '质检', '合格率', '不良率'];
    const hrKeywords = ['员工', '人力', '考勤', '薪资', '绩效', '培训', '招聘'];
    const financeKeywords = ['成本', '利润', '收入', '支出', '财务', '报表'];

    productionKeywords.forEach(k => {
      if (question.includes(k)) keywords.push(k);
    });
    inventoryKeywords.forEach(k => {
      if (question.includes(k)) keywords.push(k);
    });
    qualityKeywords.forEach(k => {
      if (question.includes(k)) keywords.push(k);
    });
    hrKeywords.forEach(k => {
      if (question.includes(k)) keywords.push(k);
    });
    financeKeywords.forEach(k => {
      if (question.includes(k)) keywords.push(k);
    });

    return keywords;
  }

  isProductionQuery(keywords: string[]): boolean {
    const productionKeywords = ['生产', '产量', '工单', '工艺', '制造', '车间', '产能'];
    return keywords.some(k => productionKeywords.includes(k));
  }

  isInventoryQuery(keywords: string[]): boolean {
    const inventoryKeywords = ['库存', '物料', '仓库', '库存数量', '库存金额', '出入库'];
    return keywords.some(k => inventoryKeywords.includes(k));
  }

  isQualityQuery(keywords: string[]): boolean {
    const qualityKeywords = ['质量', '检验', '质检', '合格率', '不良率'];
    return keywords.some(k => qualityKeywords.includes(k));
  }

  isHRQuery(keywords: string[]): boolean {
    const hrKeywords = ['员工', '人力', '考勤', '薪资', '绩效', '培训', '招聘'];
    return keywords.some(k => hrKeywords.includes(k));
  }

  isFinanceQuery(keywords: string[]): boolean {
    const financeKeywords = ['成本', '利润', '收入', '支出', '财务', '报表'];
    return keywords.some(k => financeKeywords.includes(k));
  }

  generateProductionAnswer(question: string): string {
    if (question.includes('产量') || question.includes('产能')) {
      return '您可以通过【生产统计】模块查看实时产能数据，包括：\n• 今日产量统计\n• 各车间产能利用率\n• 生产进度追踪\n• OEE设备综合效率\n\n建议使用系统提供的统计分析接口获取详细数据。';
    }
    if (question.includes('工单')) {
      return '您可以通过【生产工单】模块查询工单状态，包括：\n• 待生产工单\n• 生产中工单\n• 已完成工单\n• 工单进度详情\n\n建议提供具体的工单编号或日期范围以便查询。';
    }
    if (question.includes('工艺')) {
      return '您可以通过【工艺管理】模块查询工艺信息，包括：\n• 工艺路线定义\n• 工序标准时间\n• BOM物料清单\n• 工艺文档管理\n\n建议上传工艺文档到知识库以便更精准的查询。';
    }
    return '生产相关查询建议：\n• 查询今日产量："今日生产了多少件产品？"\n• 查询工单状态："工单WO202401001的进度如何？"\n• 查询产能："A车间今天的产能利用率是多少？"\n• 查询工艺："产品A的工艺路线是什么？"';
  }

  generateInventoryAnswer(question: string): string {
    if (question.includes('库存数量') || question.includes('库存金额')) {
      return '您可以通过【库存统计】模块查看库存数据，包括：\n• 当前库存总金额\n• 各仓库库存明细\n• 库存周转率\n• 安全库存预警\n\n建议提供物料编码或仓库名称以便查询。';
    }
    if (question.includes('物料')) {
      return '您可以通过【物料管理】模块查询物料信息，包括：\n• 物料基本信息\n• 物料分类\n• 库存批次\n• 物料追溯\n\n建议提供物料编码或名称以便查询。';
    }
    if (question.includes('出入库')) {
      return '您可以通过【出入库管理】模块查询出入库记录，包括：\n• 今日入库统计\n• 今日出库统计\n• 出入库明细\n• 库存变动趋势\n\n建议提供日期范围以便查询。';
    }
    return '库存相关查询建议：\n• 查询库存："物料M001当前库存是多少？"\n• 查询仓库："A仓库的库存总额是多少？"\n• 查询入库："今天入库了多少物料？"\n• 查询出库："本周出库了多少产品？"';
  }

  generateQualityAnswer(question: string): string {
    if (question.includes('合格率') || question.includes('不良率')) {
      return '您可以通过【质量统计】模块查看质量数据，包括：\n• 产品合格率\n• 不良品率\n• 缺陷类型分布\n• 质量趋势分析\n\n建议提供产品编码或日期范围以便查询。';
    }
    if (question.includes('检验') || question.includes('质检')) {
      return '您可以通过【质量检验】模块查询检验记录，包括：\n• 待检验任务\n• 检验结果查询\n• 检验报告\n• 不合格品处理\n\n建议提供检验单号或产品名称以便查询。';
    }
    return '质量相关查询建议：\n• 查询合格率："产品A的合格率是多少？"\n• 查询不良："本周有多少不良品？"\n• 查询检验："批次LOT001的检验结果如何？"\n• 查询趋势："近三个月的质量趋势如何？"';
  }

  generateHRAnswer(question: string): string {
    if (question.includes('员工') || question.includes('人数')) {
      return '您可以通过【员工管理】模块查看人力资源数据，包括：\n• 员工总数统计\n• 部门人员分布\n• 在职/离职人员\n• 新入职人员\n\n建议提供部门名称以便查询。';
    }
    if (question.includes('考勤')) {
      return '您可以通过【考勤管理】模块查询考勤数据，包括：\n• 今日考勤统计\n• 月度考勤汇总\n• 加班统计\n• 请假记录\n\n建议提供员工ID或日期范围以便查询。';
    }
    if (question.includes('薪资') || question.includes('薪酬')) {
      return '您可以通过【薪资管理】模块查询薪酬数据，包括：\n• 月度薪资汇总\n• 薪资明细\n• 社保公积金\n• 个税计算\n\n建议提供员工ID或月份以便查询。';
    }
    if (question.includes('绩效')) {
      return '您可以通过【绩效管理】模块查询绩效数据，包括：\n• 绩效评分\n• 绩效等级分布\n• 绩效趋势\n• 奖金计算\n\n建议提供员工ID或考核周期以便查询。';
    }
    return '人力资源相关查询建议：\n• 查询人数："公司有多少员工？"\n• 查询考勤："张三这个月的考勤情况如何？"\n• 查询薪资："李四的月度薪资是多少？"\n• 查询绩效："王五的绩效等级是什么？"';
  }

  generateFinanceAnswer(question: string): string {
    if (question.includes('成本')) {
      return '您可以通过【成本管理】模块查看成本数据，包括：\n• 产品成本核算\n• 原材料成本\n• 人工成本\n• 制造费用\n\n建议提供产品编码或期间以便查询。';
    }
    if (question.includes('利润') || question.includes('收入')) {
      return '您可以通过【经营分析】模块查看经营数据，包括：\n• 销售收入统计\n• 利润分析\n• 成本对比\n• 经营报表\n\n建议提供日期范围以便查询。';
    }
    return '财务相关查询建议：\n• 查询成本："产品A的单位成本是多少？"\n• 查询收入："本月的销售收入是多少？"\n• 查询利润："本季度的净利润是多少？"\n• 查询报表："生成月度经营报表"';
  }

  async saveMessage(sessionId: string, userId: string, role: string, content: string, moduleType?: string): Promise<void> {
    await this.conversationRepository.save({
      userId,
      sessionId,
      role,
      content,
      moduleType,
    });
  }

  async getConversation(sessionId: string): Promise<AiConversation[]> {
    return this.conversationRepository.find({
      where: { sessionId, isDeleted: 0 },
      order: { createdAt: 'ASC' },
    });
  }

  async getConversationHistory(userId: string, page = 1, pageSize = 20): Promise<any> {
    const query = this.conversationRepository.createQueryBuilder('c')
      .where('c.isDeleted = 0 AND c.role = :role AND c.userId = :userId', { role: 'user', userId })
      .select(['c.id', 'c.sessionId', 'c.content', 'c.createdAt', 'c.moduleType']);

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('c.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async deleteConversation(sessionId: string): Promise<void> {
    await this.conversationRepository.update({ sessionId }, { isDeleted: 1 });
  }
}