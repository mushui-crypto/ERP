import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CrmOpportunity } from '../../database/entities/crm-opportunity.entity';
import { CrmSalesStage } from '../../database/entities/crm-sales-stage.entity';
import { CrmOpportunityActivity } from '../../database/entities/crm-opportunity-activity.entity';

@Injectable()
export class CrmOpportunityService {
  constructor(
    @InjectRepository(CrmOpportunity)
    private opportunityRepository: Repository<CrmOpportunity>,
    @InjectRepository(CrmSalesStage)
    private stageRepository: Repository<CrmSalesStage>,
    @InjectRepository(CrmOpportunityActivity)
    private activityRepository: Repository<CrmOpportunityActivity>,
  ) {}

  async generateOpportunityNo(): Promise<string> {
    const now = new Date();
    const prefix = 'OP';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.opportunityRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async generateActivityNo(): Promise<string> {
    const now = new Date();
    const prefix = 'OA';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.activityRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async createStage(data: Partial<CrmSalesStage>): Promise<CrmSalesStage> {
    const stage = this.stageRepository.create({
      ...data,
      enabled: 1,
    });
    return this.stageRepository.save(stage);
  }

  async updateStage(id: string, data: Partial<CrmSalesStage>): Promise<CrmSalesStage> {
    const stage = await this.stageRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!stage) throw new NotFoundException('销售阶段不存在');
    Object.assign(stage, data);
    return this.stageRepository.save(stage);
  }

  async deleteStage(id: string): Promise<void> {
    const stage = await this.stageRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!stage) throw new NotFoundException('销售阶段不存在');

    const hasOpportunities = await this.opportunityRepository.count({ where: { stageId: id, isDeleted: 0 } });
    if (hasOpportunities > 0) {
      throw new BadRequestException('存在关联商机，不允许删除');
    }

    stage.isDeleted = 1;
    await this.stageRepository.save(stage);
  }

  async findStages(): Promise<CrmSalesStage[]> {
    return this.stageRepository.find({ where: { isDeleted: 0, enabled: 1 }, order: { sortOrder: 'ASC' } });
  }

  async create(data: Partial<CrmOpportunity>): Promise<CrmOpportunity> {
    const opportunityNo = await this.generateOpportunityNo();
    
    const stage = await this.stageRepository.findOne({ where: { id: data.stageId, isDeleted: 0 } });
    
    const opportunity = this.opportunityRepository.create({
      ...data,
      opportunityNo,
      probability: stage?.probability || 0,
      status: 1,
    });
    return this.opportunityRepository.save(opportunity);
  }

  async update(id: string, data: Partial<CrmOpportunity>): Promise<CrmOpportunity> {
    const opportunity = await this.opportunityRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!opportunity) throw new NotFoundException('商机不存在');

    if (data.stageId && data.stageId !== opportunity.stageId) {
      const stage = await this.stageRepository.findOne({ where: { id: data.stageId, isDeleted: 0 } });
      if (stage) {
        data.probability = stage.probability;
      }
    }

    Object.assign(opportunity, data);
    return this.opportunityRepository.save(opportunity);
  }

  async advanceStage(id: string, nextStageId: string): Promise<CrmOpportunity> {
    const opportunity = await this.opportunityRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!opportunity) throw new NotFoundException('商机不存在');

    if (opportunity.status === 2 || opportunity.status === 3) {
      throw new BadRequestException('已关闭的商机不允许推进阶段');
    }

    const nextStage = await this.stageRepository.findOne({ where: { id: nextStageId, isDeleted: 0 } });
    if (!nextStage) throw new NotFoundException('目标阶段不存在');

    const stages = await this.findStages();
    const currentStageIndex = stages.findIndex(s => s.id === opportunity.stageId);
    const nextStageIndex = stages.findIndex(s => s.id === nextStageId);

    if (nextStageIndex <= currentStageIndex) {
      throw new BadRequestException('只能推进到下一阶段');
    }

    opportunity.stageId = nextStageId;
    opportunity.stageName = nextStage.stageName;
    opportunity.probability = nextStage.probability;

    return this.opportunityRepository.save(opportunity);
  }

  async won(id: string): Promise<CrmOpportunity> {
    const opportunity = await this.opportunityRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!opportunity) throw new NotFoundException('商机不存在');

    if (opportunity.status === 2 || opportunity.status === 3) {
      throw new BadRequestException('已关闭的商机不允许操作');
    }

    opportunity.status = 2;
    return this.opportunityRepository.save(opportunity);
  }

  async lost(id: string, reason?: string): Promise<CrmOpportunity> {
    const opportunity = await this.opportunityRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!opportunity) throw new NotFoundException('商机不存在');

    if (opportunity.status === 2 || opportunity.status === 3) {
      throw new BadRequestException('已关闭的商机不允许操作');
    }

    opportunity.status = 3;
    opportunity.remark = reason || '商机丢失';
    return this.opportunityRepository.save(opportunity);
  }

  async remove(id: string): Promise<void> {
    const opportunity = await this.opportunityRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!opportunity) throw new NotFoundException('商机不存在');
    opportunity.isDeleted = 1;
    await this.opportunityRepository.save(opportunity);
  }

  async findAll(page = 1, pageSize = 20, stageId?: string, customerId?: string, status?: number): Promise<any> {
    const query = this.opportunityRepository.createQueryBuilder('o')
      .where('o.isDeleted = 0');

    if (stageId) {
      query.andWhere('o.stageId = :stageId', { stageId });
    }
    if (customerId) {
      query.andWhere('o.customerId = :customerId', { customerId });
    }
    if (status !== undefined) {
      query.andWhere('o.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('o.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<CrmOpportunity | null> {
    return this.opportunityRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async createActivity(data: Partial<CrmOpportunityActivity>): Promise<CrmOpportunityActivity> {
    const activityNo = await this.generateActivityNo();
    
    const opportunity = await this.opportunityRepository.findOne({
      where: { id: data.opportunityId, isDeleted: 0 },
    });
    if (!opportunity) throw new NotFoundException('商机不存在');

    const activity = this.activityRepository.create({
      ...data,
      activityNo,
      opportunityNo: opportunity.opportunityNo,
    });
    return this.activityRepository.save(activity);
  }

  async findActivities(opportunityId: string, page = 1, pageSize = 20): Promise<any> {
    const query = this.activityRepository.createQueryBuilder('a')
      .where('a.isDeleted = 0 AND a.opportunityId = :opportunityId', { opportunityId });

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('a.activityTime', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async getSalesFunnel(): Promise<any> {
    const stages = await this.findStages();
    const funnel = [];

    for (const stage of stages) {
      const opportunities = await this.opportunityRepository.find({
        where: { stageId: stage.id, isDeleted: 0, status: 1 },
      });
      const totalAmount = opportunities.reduce((sum, o) => sum + Number(o.amount || 0), 0);
      const weightedAmount = totalAmount * (stage.probability / 100);

      funnel.push({
        stageId: stage.id,
        stageCode: stage.stageCode,
        stageName: stage.stageName,
        opportunityCount: opportunities.length,
        totalAmount,
        weightedAmount,
        probability: stage.probability,
      });
    }

    const totalPipeline = funnel.reduce((sum, f) => sum + f.weightedAmount, 0);

    return {
      funnel,
      totalPipeline,
    };
  }

  async getStatistics(): Promise<any> {
    const totalOpportunities = await this.opportunityRepository.count({ where: { isDeleted: 0 } });
    const activeOpportunities = await this.opportunityRepository.count({ where: { isDeleted: 0, status: 1 } });
    const wonOpportunities = await this.opportunityRepository.count({ where: { isDeleted: 0, status: 2 } });
    const lostOpportunities = await this.opportunityRepository.count({ where: { isDeleted: 0, status: 3 } });

    const activeResult = await this.opportunityRepository.createQueryBuilder('o')
      .select('SUM(o.amount) as totalAmount')
      .where('o.isDeleted = 0 AND o.status = 1')
      .getRawOne();

    const wonResult = await this.opportunityRepository.createQueryBuilder('o')
      .select('SUM(o.amount) as totalAmount')
      .where('o.isDeleted = 0 AND o.status = 2')
      .getRawOne();

    const winRate = activeOpportunities + wonOpportunities > 0
      ? ((wonOpportunities / (activeOpportunities + wonOpportunities)) * 100).toFixed(2)
      : '0.00';

    return {
      totalOpportunities,
      activeOpportunities,
      wonOpportunities,
      lostOpportunities,
      activePipeline: activeResult.totalAmount || 0,
      wonAmount: wonResult.totalAmount || 0,
      winRate,
    };
  }
}