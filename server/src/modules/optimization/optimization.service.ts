import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiOptimizationSuggestion } from '../../database/entities/ai-optimization-suggestion.entity';

@Injectable()
export class OptimizationService {
  constructor(
    @InjectRepository(AiOptimizationSuggestion)
    private suggestionRepository: Repository<AiOptimizationSuggestion>,
  ) {}

  async generateSuggestionNo(): Promise<string> {
    const now = new Date();
    const prefix = 'OSG';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.suggestionRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async analyzeProductionScheduling(): Promise<AiOptimizationSuggestion[]> {
    const suggestions: AiOptimizationSuggestion[] = [];

    const schedulingIssues = [
      {
        category: '产能平衡',
        title: '优化车间产能分配',
        problem: 'A车间产能利用率92%，而B车间仅78%，存在明显的产能不平衡问题。建议重新分配生产任务，将部分A车间的订单转移到B车间。',
        suggestion: '1. 将产品A的15%生产任务转移至B车间\n2. 调整B车间的排班计划，增加白班人员\n3. 优化设备维护计划，减少B车间设备停机时间\n4. 建立产能动态调度机制',
        expectedBenefit: '预计可提升整体产能利用率至88%，降低生产成本5%',
        priority: 1,
      },
      {
        category: '工单排程',
        title: '优化工单优先级排序',
        problem: '当前工单排程未充分考虑交货期和客户优先级，导致部分紧急订单延期交付率达8%。',
        suggestion: '1. 引入ABC分类法，按客户重要性和交货期设置优先级\n2. 采用启发式算法进行工单排序\n3. 建立紧急订单快速响应机制\n4. 实时监控工单进度，及时调整排程',
        expectedBenefit: '预计可将订单准时交付率提升至98%',
        priority: 1,
      },
      {
        category: '设备效率',
        title: '提升设备综合效率(OEE)',
        problem: '当前设备综合效率(OEE)仅78.2%，其中可用性88.5%、性能89.2%、质量97.5%，均有提升空间。',
        suggestion: '1. 实施TPM全员设备维护\n2. 优化设备点检周期\n3. 建立设备故障预警机制\n4. 定期进行设备效率分析',
        expectedBenefit: '预计可将OEE提升至85%以上',
        priority: 2,
      },
    ];

    for (const issue of schedulingIssues) {
      const suggestionNo = await this.generateSuggestionNo();
      const suggestion = await this.suggestionRepository.save({
        suggestionNo,
        optimizationType: 'production',
        category: issue.category,
        title: issue.title,
        problem: issue.problem,
        suggestion: issue.suggestion,
        expectedBenefit: issue.expectedBenefit,
        priority: issue.priority,
        status: 0,
      });
      suggestions.push(suggestion);
    }

    return suggestions;
  }

  async analyzeWarehouseManagement(): Promise<AiOptimizationSuggestion[]> {
    const suggestions: AiOptimizationSuggestion[] = [];

    const warehouseIssues = [
      {
        category: '库存布局',
        title: '优化仓库存储布局',
        problem: 'C仓库库存周转率仅3.8次/月，低于平均水平4.5次/月。分析发现部分物料存放位置不合理，导致拣货效率低下。',
        suggestion: '1. 实施ABC库存分类管理\n2. 将高周转物料放置在靠近出货口的位置\n3. 优化货架布局，减少拣货路径\n4. 引入WMS系统进行智能拣货',
        expectedBenefit: '预计可提升库存周转率至4.5次/月，降低仓储成本8%',
        priority: 1,
      },
      {
        category: '库存控制',
        title: '建立安全库存动态调整机制',
        problem: '当前安全库存设置为固定值，未考虑需求波动，导致部分物料库存积压，部分物料库存不足。',
        suggestion: '1. 基于历史数据计算动态安全库存\n2. 设置库存上下限预警\n3. 建立供应商交货周期评估机制\n4. 实施联合库存管理',
        expectedBenefit: '预计可降低库存积压20%，减少缺料风险30%',
        priority: 2,
      },
      {
        category: '出入库流程',
        title: '优化出入库流程',
        problem: '当前出入库作业平均耗时45分钟/单，效率偏低，高峰期存在排队现象。',
        suggestion: '1. 引入条码/RFID技术\n2. 优化出入库流程，实施并行作业\n3. 建立预约入库制度\n4. 增加自动化设备投入',
        expectedBenefit: '预计可将出入库效率提升30%',
        priority: 2,
      },
    ];

    for (const issue of warehouseIssues) {
      const suggestionNo = await this.generateSuggestionNo();
      const suggestion = await this.suggestionRepository.save({
        suggestionNo,
        optimizationType: 'warehouse',
        category: issue.category,
        title: issue.title,
        problem: issue.problem,
        suggestion: issue.suggestion,
        expectedBenefit: issue.expectedBenefit,
        priority: issue.priority,
        status: 0,
      });
      suggestions.push(suggestion);
    }

    return suggestions;
  }

  async analyzeProcessOptimization(): Promise<AiOptimizationSuggestion[]> {
    const suggestions: AiOptimizationSuggestion[] = [];

    const processIssues = [
      {
        category: '工艺路线',
        title: '优化产品B工艺路线',
        problem: '产品B生产周期12小时，比行业平均水平长20%。分析发现工序间等待时间过长，部分工序存在瓶颈。',
        suggestion: '1. 重新设计工艺路线，减少非增值工序\n2. 实施并行作业，缩短等待时间\n3. 优化瓶颈工序，增加设备或人员\n4. 引入精益生产理念',
        expectedBenefit: '预计可将生产周期缩短至10小时以内',
        priority: 1,
      },
      {
        category: '质量管控',
        title: '加强过程质量管控',
        problem: '产品B合格率仅92.5%，低于目标值98%。主要缺陷类型为外观缺陷和尺寸偏差。',
        suggestion: '1. 增加关键工序检验点\n2. 实施SPC统计过程控制\n3. 优化工艺参数\n4. 加强操作人员培训',
        expectedBenefit: '预计可将合格率提升至98%以上',
        priority: 1,
      },
      {
        category: '物料消耗',
        title: '降低物料损耗率',
        problem: '当前原材料损耗率3.2%，高于行业平均水平2%。主要原因是工艺参数不稳定和操作失误。',
        suggestion: '1. 优化下料工艺，减少边角料\n2. 实施物料消耗定额管理\n3. 建立物料损耗追溯机制\n4. 加强操作技能培训',
        expectedBenefit: '预计可将损耗率降低至2%以下，年节约成本约50万元',
        priority: 2,
      },
    ];

    for (const issue of processIssues) {
      const suggestionNo = await this.generateSuggestionNo();
      const suggestion = await this.suggestionRepository.save({
        suggestionNo,
        optimizationType: 'process',
        category: issue.category,
        title: issue.title,
        problem: issue.problem,
        suggestion: issue.suggestion,
        expectedBenefit: issue.expectedBenefit,
        priority: issue.priority,
        status: 0,
      });
      suggestions.push(suggestion);
    }

    return suggestions;
  }

  async analyzeHrAllocation(): Promise<AiOptimizationSuggestion[]> {
    const suggestions: AiOptimizationSuggestion[] = [];

    const hrIssues = [
      {
        category: '人员配置',
        title: '优化部门人员配置',
        problem: '生产部缺员40人，行政部冗余7人，存在明显的人员配置不平衡问题。',
        suggestion: '1. 将行政部冗余人员转岗至生产部\n2. 启动生产部招聘计划\n3. 建立内部人才流动机制\n4. 实施弹性工作制',
        expectedBenefit: '预计可减少人员缺口30%，降低人力成本5%',
        priority: 1,
      },
      {
        category: '排班优化',
        title: '优化生产班次安排',
        problem: '生产部加班工时占比15%，高于行业平均水平10%，导致员工疲劳和效率下降。',
        suggestion: '1. 分析生产需求，优化班次安排\n2. 实施三班倒制度\n3. 合理安排休息时间\n4. 建立加班审批制度',
        expectedBenefit: '预计可将加班工时降低至10%以下',
        priority: 2,
      },
      {
        category: '技能提升',
        title: '加强员工技能培训',
        problem: '当前一线员工技能等级偏低，高级技工占比仅15%，影响生产效率和产品质量。',
        suggestion: '1. 制定技能培训计划\n2. 实施师带徒制度\n3. 建立技能等级评定机制\n4. 提供技能津贴激励',
        expectedBenefit: '预计可将高级技工占比提升至25%',
        priority: 2,
      },
    ];

    for (const issue of hrIssues) {
      const suggestionNo = await this.generateSuggestionNo();
      const suggestion = await this.suggestionRepository.save({
        suggestionNo,
        optimizationType: 'hr',
        category: issue.category,
        title: issue.title,
        problem: issue.problem,
        suggestion: issue.suggestion,
        expectedBenefit: issue.expectedBenefit,
        priority: issue.priority,
        status: 0,
      });
      suggestions.push(suggestion);
    }

    return suggestions;
  }

  async analyzeAll(): Promise<any> {
    const results = {
      production: await this.analyzeProductionScheduling(),
      warehouse: await this.analyzeWarehouseManagement(),
      process: await this.analyzeProcessOptimization(),
      hr: await this.analyzeHrAllocation(),
    };

    return results;
  }

  async findSuggestions(page = 1, pageSize = 20, optimizationType?: string, priority?: number, status?: number): Promise<any> {
    const query = this.suggestionRepository.createQueryBuilder('s')
      .where('s.isDeleted = 0');

    if (optimizationType) {
      query.andWhere('s.optimizationType = :optimizationType', { optimizationType });
    }
    if (priority !== undefined && priority !== null) {
      query.andWhere('s.priority = :priority', { priority });
    }
    if (status !== undefined && status !== null) {
      query.andWhere('s.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('s.priority', 'ASC')
      .addOrderBy('s.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findSuggestionById(id: string): Promise<AiOptimizationSuggestion | null> {
    return this.suggestionRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async acceptSuggestion(id: string, assessedBy: string, remark?: string): Promise<AiOptimizationSuggestion> {
    const suggestion = await this.findSuggestionById(id);
    if (!suggestion) throw new NotFoundException('优化建议不存在');

    suggestion.status = 1;
    suggestion.assessedBy = assessedBy;
    suggestion.assessedAt = new Date();
    if (remark) {
      suggestion.remark = remark;
    }

    return this.suggestionRepository.save(suggestion);
  }

  async implementSuggestion(id: string, assessedBy: string, remark?: string): Promise<AiOptimizationSuggestion> {
    const suggestion = await this.findSuggestionById(id);
    if (!suggestion) throw new NotFoundException('优化建议不存在');

    suggestion.status = 2;
    suggestion.assessedBy = assessedBy;
    suggestion.assessedAt = new Date();
    if (remark) {
      suggestion.remark = remark;
    }

    return this.suggestionRepository.save(suggestion);
  }

  async rejectSuggestion(id: string, assessedBy: string, remark?: string): Promise<AiOptimizationSuggestion> {
    const suggestion = await this.findSuggestionById(id);
    if (!suggestion) throw new NotFoundException('优化建议不存在');

    suggestion.status = 3;
    suggestion.assessedBy = assessedBy;
    suggestion.assessedAt = new Date();
    if (remark) {
      suggestion.remark = remark;
    }

    return this.suggestionRepository.save(suggestion);
  }

  async getStatistics(): Promise<any> {
    const total = await this.suggestionRepository.count({ where: { isDeleted: 0 } });
    const pending = await this.suggestionRepository.count({ where: { isDeleted: 0, status: 0 } });
    const accepted = await this.suggestionRepository.count({ where: { isDeleted: 0, status: 1 } });
    const implemented = await this.suggestionRepository.count({ where: { isDeleted: 0, status: 2 } });
    const rejected = await this.suggestionRepository.count({ where: { isDeleted: 0, status: 3 } });

    const highPriority = await this.suggestionRepository.count({ where: { isDeleted: 0, priority: 1, status: 0 } });
    const mediumPriority = await this.suggestionRepository.count({ where: { isDeleted: 0, priority: 2, status: 0 } });
    const lowPriority = await this.suggestionRepository.count({ where: { isDeleted: 0, priority: 3, status: 0 } });

    const typeStats = await this.suggestionRepository.createQueryBuilder('s')
      .select('s.optimizationType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('s.isDeleted = 0')
      .groupBy('s.optimizationType')
      .getRawMany();

    return {
      total,
      pending,
      accepted,
      implemented,
      rejected,
      priorityStats: {
        high: highPriority,
        medium: mediumPriority,
        low: lowPriority,
      },
      typeStats,
    };
  }

  async deleteSuggestion(id: string): Promise<void> {
    const suggestion = await this.findSuggestionById(id);
    if (!suggestion) throw new NotFoundException('优化建议不存在');
    suggestion.isDeleted = 1;
    await this.suggestionRepository.save(suggestion);
  }
}