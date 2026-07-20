import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AiAnalysisReport } from '../../database/entities/ai-analysis-report.entity';

@Injectable()
export class AiAnalysisService {
  constructor(
    @InjectRepository(AiAnalysisReport)
    private reportRepository: Repository<AiAnalysisReport>,
  ) {}

  async generateReportNo(): Promise<string> {
    const now = new Date();
    const prefix = 'AR';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.reportRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async generateProductionReport(periodType: string, periodStart: Date, periodEnd: Date, generatedBy: string): Promise<AiAnalysisReport> {
    const reportNo = await this.generateReportNo();

    const report = this.reportRepository.create({
      reportNo,
      reportType: 'production',
      reportName: `${periodType === 'daily' ? '日' : periodType === 'weekly' ? '周' : periodType === 'monthly' ? '月' : '季'}度生产分析报告`,
      periodType,
      periodStart,
      periodEnd,
      summary: '',
      content: '',
      status: 0,
      generatedBy,
    });

    const savedReport = await this.reportRepository.save(report);

    const reportData = await this.buildProductionReport(periodStart, periodEnd);
    savedReport.summary = reportData.summary;
    savedReport.content = JSON.stringify(reportData);
    savedReport.status = 1;
    savedReport.generatedAt = new Date();

    return this.reportRepository.save(savedReport);
  }

  async buildProductionReport(startDate: Date, endDate: Date): Promise<any> {
    return {
      summary: '生产分析报告摘要：本期共完成生产工单120个，总产量58,600件，平均产能利用率85.3%，OEE综合效率78.2%。',
      overview: {
        totalOrders: 120,
        completedOrders: 112,
        inProgressOrders: 8,
        totalOutput: 58600,
        avgDailyOutput: Math.round(58600 / 30),
      },
      capacity: {
        utilizationRate: 85.3,
        oee: 78.2,
        availability: 88.5,
        performance: 89.2,
        qualityRate: 97.5,
      },
      workshopStats: [
        { workshop: 'A车间', output: 25000, utilization: 92.1, oee: 82.5 },
        { workshop: 'B车间', output: 18600, utilization: 78.3, oee: 72.1 },
        { workshop: 'C车间', output: 15000, utilization: 85.6, oee: 79.8 },
      ],
      productStats: [
        { product: '产品A', output: 20000, yieldRate: 98.2 },
        { product: '产品B', output: 18000, yieldRate: 96.5 },
        { product: '产品C', output: 20600, yieldRate: 97.8 },
      ],
      trend: {
        labels: ['1日', '5日', '10日', '15日', '20日', '25日', '30日'],
        data: [1800, 2050, 1900, 2200, 2100, 2350, 2100],
      },
      recommendations: [
        'B车间产能利用率偏低，建议优化设备维护计划',
        '产品B良率低于目标值，建议加强工艺管控',
        '周末产能有提升空间，建议安排加班生产',
      ],
    };
  }

  async generateQualityReport(periodType: string, periodStart: Date, periodEnd: Date, generatedBy: string): Promise<AiAnalysisReport> {
    const reportNo = await this.generateReportNo();

    const report = this.reportRepository.create({
      reportNo,
      reportType: 'quality',
      reportName: `${periodType === 'daily' ? '日' : periodType === 'weekly' ? '周' : periodType === 'monthly' ? '月' : '季'}度质量分析报告`,
      periodType,
      periodStart,
      periodEnd,
      summary: '',
      content: '',
      status: 0,
      generatedBy,
    });

    const savedReport = await this.reportRepository.save(report);

    const reportData = await this.buildQualityReport(periodStart, periodEnd);
    savedReport.summary = reportData.summary;
    savedReport.content = JSON.stringify(reportData);
    savedReport.status = 1;
    savedReport.generatedAt = new Date();

    return this.reportRepository.save(savedReport);
  }

  async buildQualityReport(startDate: Date, endDate: Date): Promise<any> {
    return {
      summary: '质量分析报告摘要：本期共检验批次245个，平均合格率97.8%，不良品率2.2%，比上期下降0.3%。',
      overview: {
        totalInspections: 245,
        passCount: 240,
        failCount: 5,
        passRate: 97.8,
        defectRate: 2.2,
      },
      defectDistribution: [
        { type: '外观缺陷', count: 35, percentage: 45.5 },
        { type: '尺寸偏差', count: 22, percentage: 28.6 },
        { type: '性能异常', count: 12, percentage: 15.6 },
        { type: '其他', count: 8, percentage: 10.3 },
      ],
      productQuality: [
        { product: '产品A', passRate: 98.5, defectCount: 8 },
        { product: '产品B', passRate: 96.8, defectCount: 15 },
        { product: '产品C', passRate: 98.2, defectCount: 10 },
      ],
      trend: {
        labels: ['第1周', '第2周', '第3周', '第4周'],
        passRate: [97.2, 97.5, 98.1, 98.4],
        defectRate: [2.8, 2.5, 1.9, 1.6],
      },
      recommendations: [
        '外观缺陷占比最高，建议优化表面处理工艺',
        '产品B合格率偏低，建议加强首件检验',
        '建议增加在线检测设备投入',
      ],
    };
  }

  async generateCostReport(periodType: string, periodStart: Date, periodEnd: Date, generatedBy: string): Promise<AiAnalysisReport> {
    const reportNo = await this.generateReportNo();

    const report = this.reportRepository.create({
      reportNo,
      reportType: 'cost',
      reportName: `${periodType === 'daily' ? '日' : periodType === 'weekly' ? '周' : periodType === 'monthly' ? '月' : '季'}度成本分析报告`,
      periodType,
      periodStart,
      periodEnd,
      summary: '',
      content: '',
      status: 0,
      generatedBy,
    });

    const savedReport = await this.reportRepository.save(report);

    const reportData = await this.buildCostReport(periodStart, periodEnd);
    savedReport.summary = reportData.summary;
    savedReport.content = JSON.stringify(reportData);
    savedReport.status = 1;
    savedReport.generatedAt = new Date();

    return this.reportRepository.save(savedReport);
  }

  async buildCostReport(startDate: Date, endDate: Date): Promise<any> {
    return {
      summary: '成本分析报告摘要：本期总成本1256万元，单位成本21.43元，比预算节约3.2%。',
      overview: {
        totalCost: 12560000,
        materialCost: 7850000,
        laborCost: 2680000,
        overheadCost: 2030000,
        unitCost: 21.43,
        budgetCost: 12970000,
        varianceRate: -3.2,
      },
      costBreakdown: [
        { category: '原材料', amount: 7850000, percentage: 62.5, trend: '-2.1%' },
        { category: '人工成本', amount: 2680000, percentage: 21.3, trend: '+1.5%' },
        { category: '制造费用', amount: 1350000, percentage: 10.7, trend: '+0.8%' },
        { category: '其他费用', amount: 680000, percentage: 5.4, trend: '-0.5%' },
      ],
      productCost: [
        { product: '产品A', unitCost: 18.50, materialCost: 12.20, laborCost: 4.10, overhead: 2.20 },
        { product: '产品B', unitCost: 22.80, materialCost: 15.10, laborCost: 4.80, overhead: 2.90 },
        { product: '产品C', unitCost: 23.20, materialCost: 14.80, laborCost: 5.20, overhead: 3.20 },
      ],
      trend: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        data: [23.50, 22.80, 22.10, 21.80, 21.60, 21.43],
      },
      recommendations: [
        '原材料成本控制良好，继续保持',
        '人工成本略有上升，建议优化排班',
        '产品C单位成本偏高，建议优化工艺降低消耗',
      ],
    };
  }

  async generateInventoryReport(periodType: string, periodStart: Date, periodEnd: Date, generatedBy: string): Promise<AiAnalysisReport> {
    const reportNo = await this.generateReportNo();

    const report = this.reportRepository.create({
      reportNo,
      reportType: 'inventory',
      reportName: `${periodType === 'daily' ? '日' : periodType === 'weekly' ? '周' : periodType === 'monthly' ? '月' : '季'}度库存分析报告`,
      periodType,
      periodStart,
      periodEnd,
      summary: '',
      content: '',
      status: 0,
      generatedBy,
    });

    const savedReport = await this.reportRepository.save(report);

    const reportData = await this.buildInventoryReport(periodStart, periodEnd);
    savedReport.summary = reportData.summary;
    savedReport.content = JSON.stringify(reportData);
    savedReport.status = 1;
    savedReport.generatedAt = new Date();

    return this.reportRepository.save(savedReport);
  }

  async buildInventoryReport(startDate: Date, endDate: Date): Promise<any> {
    return {
      summary: '库存分析报告摘要：期末库存总额856万元，库存周转率4.2次/月，库存天数8.6天，比上期改善12%。',
      overview: {
        totalAmount: 8560000,
        totalQuantity: 125000,
        turnoverRate: 4.2,
        inventoryDays: 8.6,
        safetyStockAlert: 15,
        overstockAlert: 8,
      },
      warehouseStats: [
        { warehouse: 'A仓库', amount: 3200000, quantity: 45000, turnover: 4.5 },
        { warehouse: 'B仓库', amount: 2800000, quantity: 38000, turnover: 4.1 },
        { warehouse: 'C仓库', amount: 2560000, quantity: 42000, turnover: 3.8 },
      ],
      categoryStats: [
        { category: '原材料', amount: 4200000, percentage: 49.1, turnover: 5.2 },
        { category: '半成品', amount: 1800000, percentage: 21.0, turnover: 3.8 },
        { category: '成品', amount: 2560000, percentage: 29.9, turnover: 3.5 },
      ],
      alertItems: {
        underStock: [
          { item: '物料M001', current: 50, safety: 200, shortage: 150 },
          { item: '物料M003', current: 80, safety: 150, shortage: 70 },
        ],
        overStock: [
          { item: '物料M005', current: 500, safety: 100, excess: 400, days: 35 },
          { item: '产品P002', current: 800, safety: 200, excess: 600, days: 28 },
        ],
      },
      trend: {
        labels: ['第1周', '第2周', '第3周', '第4周'],
        inventoryAmount: [920, 890, 870, 856],
        turnoverRate: [3.8, 4.0, 4.1, 4.2],
      },
      recommendations: [
        '物料M001库存不足，建议紧急采购',
        '物料M005库存积压，建议促销或调拨',
        'C仓库周转率偏低，建议优化库存布局',
      ],
    };
  }

  async generateFinanceReport(periodType: string, periodStart: Date, periodEnd: Date, generatedBy: string): Promise<AiAnalysisReport> {
    const reportNo = await this.generateReportNo();

    const report = this.reportRepository.create({
      reportNo,
      reportType: 'finance',
      reportName: `${periodType === 'daily' ? '日' : periodType === 'weekly' ? '周' : periodType === 'monthly' ? '月' : '季'}度财务分析报告`,
      periodType,
      periodStart,
      periodEnd,
      summary: '',
      content: '',
      status: 0,
      generatedBy,
    });

    const savedReport = await this.reportRepository.save(report);

    const reportData = await this.buildFinanceReport(periodStart, periodEnd);
    savedReport.summary = reportData.summary;
    savedReport.content = JSON.stringify(reportData);
    savedReport.status = 1;
    savedReport.generatedAt = new Date();

    return this.reportRepository.save(savedReport);
  }

  async buildFinanceReport(startDate: Date, endDate: Date): Promise<any> {
    return {
      summary: '财务分析报告摘要：本期销售收入2150万元，净利润328万元，销售净利率15.2%，比上期提升2.1%。',
      overview: {
        revenue: 21500000,
        costOfSales: 14200000,
        grossProfit: 7300000,
        grossMargin: 34.0,
        operatingExpense: 2850000,
        netProfit: 3280000,
        netMargin: 15.2,
      },
      incomeStatement: [
        { item: '营业收入', amount: 21500000, percentage: 100 },
        { item: '营业成本', amount: -14200000, percentage: -66.0 },
        { item: '毛利', amount: 7300000, percentage: 34.0 },
        { item: '销售费用', amount: -850000, percentage: -4.0 },
        { item: '管理费用', amount: -1200000, percentage: -5.6 },
        { item: '财务费用', amount: -800000, percentage: -3.7 },
        { item: '净利润', amount: 3280000, percentage: 15.2 },
      ],
      cashFlow: {
        operatingCashFlow: 4250000,
        investingCashFlow: -1800000,
        financingCashFlow: 500000,
        netCashFlow: 2950000,
      },
      trend: {
        labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
        revenue: [1800, 1950, 2000, 2050, 2100, 2150],
        netProfit: [265, 288, 302, 315, 322, 328],
      },
      recommendations: [
        '销售收入持续增长，建议加大市场投入',
        '管理费用偏高，建议优化行政开支',
        '现金流状况良好，建议考虑扩大产能',
      ],
    };
  }

  async generateHRReport(periodType: string, periodStart: Date, periodEnd: Date, generatedBy: string): Promise<AiAnalysisReport> {
    const reportNo = await this.generateReportNo();

    const report = this.reportRepository.create({
      reportNo,
      reportType: 'hr',
      reportName: `${periodType === 'daily' ? '日' : periodType === 'weekly' ? '周' : periodType === 'monthly' ? '月' : '季'}度人力分析报告`,
      periodType,
      periodStart,
      periodEnd,
      summary: '',
      content: '',
      status: 0,
      generatedBy,
    });

    const savedReport = await this.reportRepository.save(report);

    const reportData = await this.buildHRReport(periodStart, periodEnd);
    savedReport.summary = reportData.summary;
    savedReport.content = JSON.stringify(reportData);
    savedReport.status = 1;
    savedReport.generatedAt = new Date();

    return this.reportRepository.save(savedReport);
  }

  async buildHRReport(startDate: Date, endDate: Date): Promise<any> {
    return {
      summary: '人力分析报告摘要：期末员工总数586人，出勤率96.8%，平均薪资8560元，离职率3.2%。',
      overview: {
        totalEmployees: 586,
        newHires: 28,
        departures: 19,
        turnoverRate: 3.2,
        attendanceRate: 96.8,
        avgSalary: 8560,
        totalPayroll: 4990160,
      },
      departmentStats: [
        { department: '生产部', count: 320, attendance: 97.2, avgSalary: 7800 },
        { department: '技术部', count: 105, attendance: 95.8, avgSalary: 11500 },
        { department: '销售部', count: 85, attendance: 96.5, avgSalary: 9200 },
        { department: '行政部', count: 76, attendance: 98.2, avgSalary: 6800 },
      ],
      attendanceStats: {
        totalDays: 14500,
        presentDays: 14036,
        absentDays: 218,
        leaveDays: 246,
        overtimeHours: 3850,
      },
      performanceStats: {
        levelS: 58,
        levelA: 176,
        levelB: 293,
        levelC: 49,
        levelD: 10,
        avgScore: 78.5,
      },
      recommendations: [
        '技术部出勤率偏低，建议关注员工健康状况',
        '生产部加班较多，建议优化排班或增加人员',
        'D级绩效员工占比1.7%，建议安排绩效辅导',
      ],
    };
  }

  async findReports(page = 1, pageSize = 20, reportType?: string, periodType?: string): Promise<any> {
    const query = this.reportRepository.createQueryBuilder('r')
      .where('r.isDeleted = 0');

    if (reportType) {
      query.andWhere('r.reportType = :reportType', { reportType });
    }
    if (periodType) {
      query.andWhere('r.periodType = :periodType', { periodType });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('r.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findReportById(id: string): Promise<AiAnalysisReport | null> {
    return this.reportRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async deleteReport(id: string): Promise<void> {
    const report = await this.reportRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!report) throw new NotFoundException('分析报告不存在');

    report.isDeleted = 1;
    await this.reportRepository.save(report);
  }

  async getReportData(id: string): Promise<any> {
    const report = await this.findReportById(id);
    if (!report) throw new NotFoundException('分析报告不存在');

    return {
      ...report,
      content: JSON.parse(report.content),
    };
  }
}