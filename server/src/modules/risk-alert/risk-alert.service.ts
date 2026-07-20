import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiskAlert } from '../../database/entities/risk-alert.entity';

@Injectable()
export class RiskAlertService {
  constructor(
    @InjectRepository(RiskAlert)
    private riskAlertRepository: Repository<RiskAlert>,
  ) {}

  async findAll(page = 1, pageSize = 20, alertType?: number, alertLevel?: number, status?: number): Promise<any> {
    const query = this.riskAlertRepository.createQueryBuilder('alert')
      .where('alert.isDeleted = 0');

    if (alertType !== undefined && alertType !== null) {
      query.andWhere('alert.alertType = :alertType', { alertType });
    }
    if (alertLevel !== undefined && alertLevel !== null) {
      query.andWhere('alert.alertLevel = :alertLevel', { alertLevel });
    }
    if (status !== undefined && status !== null) {
      query.andWhere('alert.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('alert.alertLevel', 'ASC')
      .addOrderBy('alert.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<RiskAlert | null> {
    return this.riskAlertRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async create(data: Partial<RiskAlert>): Promise<RiskAlert> {
    const riskAlert = this.riskAlertRepository.create(data);
    return this.riskAlertRepository.save(riskAlert);
  }

  async update(id: string, data: Partial<RiskAlert>): Promise<RiskAlert> {
    const riskAlert = await this.findById(id);
    if (!riskAlert) throw new NotFoundException('风险预警不存在');
    Object.assign(riskAlert, data);
    return this.riskAlertRepository.save(riskAlert);
  }

  async handleAlert(id: string, handledBy: string, remark?: string): Promise<RiskAlert> {
    const alert = await this.findById(id);
    if (!alert) throw new NotFoundException('风险预警不存在');

    alert.status = 1;
    alert.handledBy = handledBy;
    alert.handledAt = new Date();
    if (remark) {
      alert.remark = remark;
    }

    return this.riskAlertRepository.save(alert);
  }

  async ignoreAlert(id: string, handledBy: string, remark?: string): Promise<RiskAlert> {
    const alert = await this.findById(id);
    if (!alert) throw new NotFoundException('风险预警不存在');

    alert.status = 2;
    alert.handledBy = handledBy;
    alert.handledAt = new Date();
    if (remark) {
      alert.remark = remark;
    }

    return this.riskAlertRepository.save(alert);
  }

  async remove(id: string): Promise<void> {
    const riskAlert = await this.findById(id);
    if (!riskAlert) throw new NotFoundException('风险预警不存在');
    riskAlert.isDeleted = 1;
    await this.riskAlertRepository.save(riskAlert);
  }

  async detectAllRisks(): Promise<any> {
    const results = {
      materialShortage: await this.detectMaterialShortage(),
      overstock: await this.detectOverstock(),
      qualityAbnormal: await this.detectQualityAbnormal(),
      costFluctuation: await this.detectCostFluctuation(),
      hrSurplus: await this.detectHrSurplus(),
      hrShortage: await this.detectHrShortage(),
    };

    return results;
  }

  async detectMaterialShortage(): Promise<any[]> {
    const alerts: any[] = [];

    const shortageItems = [
      { itemCode: 'M001', itemName: '原材料A', currentStock: 50, safetyStock: 200, requiredDate: '2024-01-20' },
      { itemCode: 'M003', itemName: '原材料C', currentStock: 80, safetyStock: 150, requiredDate: '2024-01-22' },
      { itemCode: 'M007', itemName: '零件G', currentStock: 30, safetyStock: 100, requiredDate: '2024-01-18' },
    ];

    for (const item of shortageItems) {
      const shortage = item.safetyStock - item.currentStock;
      const level = shortage > item.safetyStock * 0.5 ? 1 : shortage > item.safetyStock * 0.2 ? 2 : 3;

      const exists = await this.riskAlertRepository.findOne({
        where: {
          alertType: 1,
          sourceType: 'material',
          sourceId: item.itemCode,
          status: 0,
          isDeleted: 0,
        },
      });

      if (!exists) {
        const alert = await this.create({
          alertType: 1,
          alertLevel: level,
          title: `缺料预警：${item.itemName}库存不足`,
          description: `物料${item.itemName}(${item.itemCode})当前库存${item.currentStock}，安全库存${item.safetyStock}，短缺${shortage}，预计需求日期${item.requiredDate}`,
          sourceType: 'material',
          sourceId: item.itemCode,
          suggestion: level === 1 
            ? '紧急采购！建议立即下单采购，避免影响生产进度' 
            : '建议尽快安排采购，确保物料及时到位',
        });
        alerts.push(alert);
      }
    }

    return alerts;
  }

  async detectOverstock(): Promise<any[]> {
    const alerts: any[] = [];

    const overstockItems = [
      { itemCode: 'M005', itemName: '原材料E', currentStock: 500, safetyStock: 100, days: 35 },
      { itemCode: 'P002', itemName: '产品B', currentStock: 800, safetyStock: 200, days: 28 },
      { itemCode: 'M010', itemName: '零件J', currentStock: 300, safetyStock: 50, days: 42 },
    ];

    for (const item of overstockItems) {
      const excess = item.currentStock - item.safetyStock;
      const level = item.days > 30 ? 1 : item.days > 20 ? 2 : 3;

      const exists = await this.riskAlertRepository.findOne({
        where: {
          alertType: 2,
          sourceType: 'inventory',
          sourceId: item.itemCode,
          status: 0,
          isDeleted: 0,
        },
      });

      if (!exists) {
        const alert = await this.create({
          alertType: 2,
          alertLevel: level,
          title: `积压预警：${item.itemName}库存积压`,
          description: `物料${item.itemName}(${item.itemCode})当前库存${item.currentStock}，超出安全库存${excess}，预计可使用${item.days}天`,
          sourceType: 'inventory',
          sourceId: item.itemCode,
          suggestion: level === 1 
            ? '严重积压！建议立即促销、调拨或退货处理' 
            : '建议制定促销计划或调拨到其他仓库',
        });
        alerts.push(alert);
      }
    }

    return alerts;
  }

  async detectQualityAbnormal(): Promise<any[]> {
    const alerts: any[] = [];

    const abnormalItems = [
      { productCode: 'P002', productName: '产品B', passRate: 92.5, targetRate: 98, defectCount: 15 },
      { productCode: 'P005', productName: '产品E', passRate: 91.2, targetRate: 98, defectCount: 22 },
    ];

    for (const item of abnormalItems) {
      const deviation = item.targetRate - item.passRate;
      const level = deviation > 5 ? 1 : deviation > 3 ? 2 : 3;

      const exists = await this.riskAlertRepository.findOne({
        where: {
          alertType: 3,
          sourceType: 'quality',
          sourceId: item.productCode,
          status: 0,
          isDeleted: 0,
        },
      });

      if (!exists) {
        const alert = await this.create({
          alertType: 3,
          alertLevel: level,
          title: `质量异常预警：${item.productName}合格率偏低`,
          description: `产品${item.productName}(${item.productCode})当期合格率${item.passRate}%，目标值${item.targetRate}%，偏差${deviation.toFixed(1)}%，不良品${item.defectCount}件`,
          sourceType: 'quality',
          sourceId: item.productCode,
          suggestion: level === 1 
            ? '严重质量异常！建议立即停产检查工艺参数和原材料' 
            : '建议加强过程检验，分析不良原因并采取改进措施',
        });
        alerts.push(alert);
      }
    }

    return alerts;
  }

  async detectCostFluctuation(): Promise<any[]> {
    const alerts: any[] = [];

    const fluctuationItems = [
      { itemCode: 'M001', itemName: '原材料A', currentPrice: 125, avgPrice: 100, changeRate: 25 },
      { itemCode: 'M002', itemName: '原材料B', currentPrice: 88, avgPrice: 75, changeRate: 17.3 },
    ];

    for (const item of fluctuationItems) {
      const level = item.changeRate > 20 ? 1 : item.changeRate > 10 ? 2 : 3;

      const exists = await this.riskAlertRepository.findOne({
        where: {
          alertType: 4,
          sourceType: 'cost',
          sourceId: item.itemCode,
          status: 0,
          isDeleted: 0,
        },
      });

      if (!exists) {
        const alert = await this.create({
          alertType: 4,
          alertLevel: level,
          title: `成本波动预警：${item.itemName}价格上涨`,
          description: `物料${item.itemName}(${item.itemCode})当前单价${item.currentPrice}元，环比上涨${item.changeRate.toFixed(1)}%，平均单价${item.avgPrice}元`,
          sourceType: 'cost',
          sourceId: item.itemCode,
          suggestion: level === 1 
            ? '成本大幅上涨！建议寻找替代供应商或调整产品定价' 
            : '建议评估成本影响，考虑采购策略调整',
        });
        alerts.push(alert);
      }
    }

    return alerts;
  }

  async detectHrSurplus(): Promise<any[]> {
    const alerts: any[] = [];

    const surplusDepts = [
      { deptCode: 'D003', deptName: '行政部', currentStaff: 25, requiredStaff: 18, surplus: 7 },
    ];

    for (const dept of surplusDepts) {
      const level = dept.surplus > dept.requiredStaff * 0.3 ? 1 : dept.surplus > dept.requiredStaff * 0.15 ? 2 : 3;

      const exists = await this.riskAlertRepository.findOne({
        where: {
          alertType: 5,
          sourceType: 'hr',
          sourceId: dept.deptCode,
          status: 0,
          isDeleted: 0,
        },
      });

      if (!exists) {
        const alert = await this.create({
          alertType: 5,
          alertLevel: level,
          title: `人力冗余预警：${dept.deptName}人员过剩`,
          description: `${dept.deptName}(${dept.deptCode})当前人员${dept.currentStaff}人，需求${dept.requiredStaff}人，冗余${dept.surplus}人`,
          sourceType: 'hr',
          sourceId: dept.deptCode,
          suggestion: '建议进行岗位调整、内部转岗或优化编制',
        });
        alerts.push(alert);
      }
    }

    return alerts;
  }

  async detectHrShortage(): Promise<any[]> {
    const alerts: any[] = [];

    const shortageDepts = [
      { deptCode: 'D001', deptName: '生产部', currentStaff: 180, requiredStaff: 220, shortage: 40 },
      { deptCode: 'D002', deptName: '技术部', currentStaff: 45, requiredStaff: 60, shortage: 15 },
    ];

    for (const dept of shortageDepts) {
      const level = dept.shortage > dept.requiredStaff * 0.15 ? 1 : dept.shortage > dept.requiredStaff * 0.08 ? 2 : 3;

      const exists = await this.riskAlertRepository.findOne({
        where: {
          alertType: 6,
          sourceType: 'hr',
          sourceId: dept.deptCode,
          status: 0,
          isDeleted: 0,
        },
      });

      if (!exists) {
        const alert = await this.create({
          alertType: 6,
          alertLevel: level,
          title: `人力短缺预警：${dept.deptName}人员不足`,
          description: `${dept.deptName}(${dept.deptCode})当前人员${dept.currentStaff}人，需求${dept.requiredStaff}人，短缺${dept.shortage}人`,
          sourceType: 'hr',
          sourceId: dept.deptCode,
          suggestion: level === 1 
            ? '紧急招聘！建议立即启动招聘流程，考虑加班或外包' 
            : '建议制定招聘计划，确保人员及时到位',
        });
        alerts.push(alert);
      }
    }

    return alerts;
  }

  async getStatistics(): Promise<any> {
    const total = await this.riskAlertRepository.count({ where: { isDeleted: 0 } });
    const unhandled = await this.riskAlertRepository.count({ where: { isDeleted: 0, status: 0 } });
    const handled = await this.riskAlertRepository.count({ where: { isDeleted: 0, status: 1 } });
    const ignored = await this.riskAlertRepository.count({ where: { isDeleted: 0, status: 2 } });

    const highLevel = await this.riskAlertRepository.count({ where: { isDeleted: 0, alertLevel: 1, status: 0 } });
    const mediumLevel = await this.riskAlertRepository.count({ where: { isDeleted: 0, alertLevel: 2, status: 0 } });
    const lowLevel = await this.riskAlertRepository.count({ where: { isDeleted: 0, alertLevel: 3, status: 0 } });

    const typeStats = await this.riskAlertRepository.createQueryBuilder('alert')
      .select('alert.alertType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('alert.isDeleted = 0 AND alert.status = 0')
      .groupBy('alert.alertType')
      .getRawMany();

    return {
      total,
      unhandled,
      handled,
      ignored,
      levelStats: {
        high: highLevel,
        medium: mediumLevel,
        low: lowLevel,
      },
      typeStats,
    };
  }
}