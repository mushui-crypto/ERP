import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BiDashboard } from '../../database/entities/bi-dashboard.entity';
import { BiWidget } from '../../database/entities/bi-widget.entity';

@Injectable()
export class DecisionAnalysisService {
  constructor(
    @InjectRepository(BiDashboard)
    private dashboardRepository: Repository<BiDashboard>,
    @InjectRepository(BiWidget)
    private widgetRepository: Repository<BiWidget>,
  ) {}

  async findDashboards(page = 1, pageSize = 20, category?: string): Promise<any> {
    const query = this.dashboardRepository.createQueryBuilder('d')
      .where('d.isDeleted = 0');

    if (category) {
      query.andWhere('d.category = :category', { category });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('d.sortOrder', 'ASC')
      .addOrderBy('d.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findDashboardById(id: string): Promise<BiDashboard | null> {
    return this.dashboardRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findDashboardByCode(code: string): Promise<BiDashboard | null> {
    return this.dashboardRepository.findOne({ where: { dashboardCode: code, isDeleted: 0 } });
  }

  async createDashboard(data: Partial<BiDashboard>): Promise<BiDashboard> {
    const existing = await this.findDashboardByCode(data.dashboardCode);
    if (existing) {
      throw new BadRequestException('仪表盘编码已存在');
    }

    const dashboard = this.dashboardRepository.create({
      ...data,
      status: 1,
    });
    return this.dashboardRepository.save(dashboard);
  }

  async updateDashboard(id: string, data: Partial<BiDashboard>): Promise<BiDashboard> {
    const dashboard = await this.findDashboardById(id);
    if (!dashboard) throw new NotFoundException('仪表盘不存在');
    Object.assign(dashboard, data);
    return this.dashboardRepository.save(dashboard);
  }

  async deleteDashboard(id: string): Promise<void> {
    const dashboard = await this.findDashboardById(id);
    if (!dashboard) throw new NotFoundException('仪表盘不存在');
    dashboard.isDeleted = 1;
    await this.dashboardRepository.save(dashboard);
  }

  async getDashboardWithWidgets(id: string): Promise<any> {
    const dashboard = await this.findDashboardById(id);
    if (!dashboard) throw new NotFoundException('仪表盘不存在');

    const widgetIds = dashboard.widgetIds ? dashboard.widgetIds.split(',').map(id => id.trim()) : [];
    const widgets = await this.widgetRepository.findByIds(widgetIds);

    return {
      ...dashboard,
      widgets,
    };
  }

  async findWidgets(page = 1, pageSize = 20, widgetType?: string): Promise<any> {
    const query = this.widgetRepository.createQueryBuilder('w')
      .where('w.isDeleted = 0');

    if (widgetType) {
      query.andWhere('w.widgetType = :widgetType', { widgetType });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('w.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findWidgetById(id: string): Promise<BiWidget | null> {
    return this.widgetRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findWidgetByCode(code: string): Promise<BiWidget | null> {
    return this.widgetRepository.findOne({ where: { widgetCode: code, isDeleted: 0 } });
  }

  async createWidget(data: Partial<BiWidget>): Promise<BiWidget> {
    const existing = await this.findWidgetByCode(data.widgetCode);
    if (existing) {
      throw new BadRequestException('组件编码已存在');
    }

    const widget = this.widgetRepository.create({
      ...data,
      status: 1,
    });
    return this.widgetRepository.save(widget);
  }

  async updateWidget(id: string, data: Partial<BiWidget>): Promise<BiWidget> {
    const widget = await this.findWidgetById(id);
    if (!widget) throw new NotFoundException('组件不存在');
    Object.assign(widget, data);
    return this.widgetRepository.save(widget);
  }

  async deleteWidget(id: string): Promise<void> {
    const widget = await this.findWidgetById(id);
    if (!widget) throw new NotFoundException('组件不存在');
    widget.isDeleted = 1;
    await this.widgetRepository.save(widget);
  }

  async getWidgetData(widgetId: string, params?: any): Promise<any> {
    const widget = await this.findWidgetById(widgetId);
    if (!widget) throw new NotFoundException('组件不存在');

    const queryConfig = widget.queryConfig ? JSON.parse(widget.queryConfig) : {};

    const mockData = this.generateMockData(widget.widgetType, widget.chartType, queryConfig);

    return {
      widget,
      data: mockData,
    };
  }

  generateMockData(widgetType: string, chartType: string, config: any): any {
    const labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

    switch (widgetType) {
      case 'number':
        return {
          value: Math.floor(Math.random() * 100000) + 50000,
          unit: '元',
          change: (Math.random() - 0.5) * 20,
          trend: (Math.random() - 0.5) > 0 ? 'up' : 'down',
        };
      case 'chart':
        switch (chartType) {
          case 'line':
            return {
              labels,
              datasets: [
                {
                  name: '销售额',
                  data: labels.map(() => Math.floor(Math.random() * 50000) + 10000),
                },
                {
                  name: '成本',
                  data: labels.map(() => Math.floor(Math.random() * 30000) + 5000),
                },
              ],
            };
          case 'bar':
            return {
              labels,
              datasets: [
                {
                  name: '订单数',
                  data: labels.map(() => Math.floor(Math.random() * 500) + 100),
                },
                {
                  name: '退货数',
                  data: labels.map(() => Math.floor(Math.random() * 50) + 10),
                },
              ],
            };
          case 'pie':
            return {
              labels: ['生产部', '销售部', '财务部', '采购部', '仓储部'],
              datasets: [
                {
                  name: '人员分布',
                  data: [30, 25, 15, 20, 10],
                },
              ],
            };
          case 'area':
            return {
              labels,
              datasets: [
                {
                  name: '库存金额',
                  data: labels.map(() => Math.floor(Math.random() * 200000) + 100000),
                },
              ],
            };
          default:
            return {
              labels,
              datasets: [
                {
                  name: '数据',
                  data: labels.map(() => Math.floor(Math.random() * 1000) + 100),
                },
              ],
            };
        }
      case 'table':
        return {
          columns: ['产品名称', '销售数量', '销售额', '毛利率'],
          data: Array(10).fill(null).map((_, i) => ({
            name: `产品${i + 1}`,
            quantity: Math.floor(Math.random() * 1000) + 100,
            amount: (Math.floor(Math.random() * 10000) + 1000).toFixed(2),
            rate: ((Math.random() * 30) + 10).toFixed(1),
          })),
        };
      case 'card':
        return {
          title: '今日概览',
          items: [
            { label: '订单数', value: Math.floor(Math.random() * 100) + 50, change: (Math.random() - 0.5) * 10 },
            { label: '销售额', value: (Math.floor(Math.random() * 50000) + 10000).toFixed(0), change: (Math.random() - 0.5) * 15 },
            { label: '发货数', value: Math.floor(Math.random() * 80) + 30, change: (Math.random() - 0.5) * 8 },
            { label: '退货数', value: Math.floor(Math.random() * 10) + 2, change: (Math.random() - 0.5) * 12 },
          ],
        };
      case 'gauge':
        return {
          value: Math.floor(Math.random() * 30) + 70,
          max: 100,
          title: '设备利用率',
          unit: '%',
        };
      default:
        return {};
    }
  }

  async getProductionAnalysis(params?: any): Promise<any> {
    return {
      title: '生产分析报告',
      summary: '本月生产效率稳步提升，产量达到预期目标的105%',
      metrics: {
        totalOutput: 12500,
        targetOutput: 12000,
        efficiency: 92.5,
        defectRate: 1.2,
        oee: 85.3,
      },
      charts: {
        dailyOutput: {
          type: 'line',
          labels: ['1日', '5日', '10日', '15日', '20日', '25日', '30日'],
          data: [400, 420, 380, 450, 430, 460, 440],
        },
        productOutput: {
          type: 'bar',
          labels: ['产品A', '产品B', '产品C', '产品D'],
          data: [3500, 4200, 2800, 2000],
        },
      },
    };
  }

  async getQualityAnalysis(params?: any): Promise<any> {
    return {
      title: '质量分析报告',
      summary: '本月质量合格率保持在98.5%以上，不良率有所下降',
      metrics: {
        passRate: 98.7,
        defectCount: 162,
        totalInspected: 12000,
        majorDefects: 12,
        minorDefects: 150,
      },
      charts: {
        defectTrend: {
          type: 'line',
          labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
          data: [2.5, 2.2, 1.8, 1.5, 1.3, 1.2],
        },
        defectType: {
          type: 'pie',
          labels: ['外观缺陷', '尺寸偏差', '性能不良', '包装破损'],
          data: [45, 30, 15, 10],
        },
      },
    };
  }

  async getInventoryAnalysis(params?: any): Promise<any> {
    return {
      title: '库存分析报告',
      summary: '库存周转率提升5%，滞销库存占比下降至3%',
      metrics: {
        totalValue: 2580000,
        turnoverRate: 6.8,
        safetyStockDays: 15,
        slowMovingRatio: 3.2,
        shortageItems: 8,
      },
      charts: {
        inventoryByCategory: {
          type: 'bar',
          labels: ['原材料', '半成品', '成品', '备件'],
          data: [850000, 620000, 980000, 130000],
        },
        turnoverTrend: {
          type: 'line',
          labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
          data: [5.2, 5.8, 6.1, 6.4, 6.6, 6.8],
        },
      },
    };
  }

  async getFinanceAnalysis(params?: any): Promise<any> {
    return {
      title: '财务分析报告',
      summary: '营业收入同比增长12%，成本控制良好',
      metrics: {
        revenue: 5800000,
        cost: 3200000,
        profit: 2600000,
        profitMargin: 44.8,
        cashFlow: 1200000,
      },
      charts: {
        revenueCost: {
          type: 'line',
          labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
          datasets: [
            { name: '营收', data: [850000, 920000, 880000, 1050000, 1100000, 1000000] },
            { name: '成本', data: [480000, 520000, 500000, 580000, 620000, 500000] },
          ],
        },
        expenseDistribution: {
          type: 'pie',
          labels: ['原材料', '人工', '制造费用', '管理费用', '销售费用'],
          data: [40, 25, 15, 12, 8],
        },
      },
    };
  }

  async getSalesAnalysis(params?: any): Promise<any> {
    return {
      title: '销售分析报告',
      summary: '销售额同比增长15%，客户满意度提升至96%',
      metrics: {
        totalOrders: 2850,
        totalAmount: 4200000,
        avgOrderValue: 1473,
        customerCount: 1250,
        satisfaction: 96.2,
      },
      charts: {
        salesByRegion: {
          type: 'bar',
          labels: ['华东', '华南', '华北', '西南', '华中'],
          data: [1250000, 980000, 820000, 650000, 500000],
        },
        monthlySales: {
          type: 'line',
          labels: ['1月', '2月', '3月', '4月', '5月', '6月'],
          data: [650000, 580000, 720000, 750000, 780000, 720000],
        },
      },
    };
  }
}