import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerformancePlan } from '../../database/entities/performance-plan.entity';
import { PerformanceResult } from '../../database/entities/performance-result.entity';

@Injectable()
export class PerformanceService {
  constructor(
    @InjectRepository(PerformancePlan)
    private planRepository: Repository<PerformancePlan>,
    @InjectRepository(PerformanceResult)
    private resultRepository: Repository<PerformanceResult>,
  ) {}

  async generatePlanNo(): Promise<string> {
    const now = new Date();
    const prefix = 'PP';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.planRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async generateResultNo(): Promise<string> {
    const now = new Date();
    const prefix = 'PR';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.resultRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  calculatePerformanceLevel(score: number): string {
    if (score >= 95) return 'S';
    if (score >= 85) return 'A';
    if (score >= 75) return 'B';
    if (score >= 60) return 'C';
    return 'D';
  }

  calculateBonusRatio(level: string): number {
    const ratios: Record<string, number> = {
      'S': 2.0,
      'A': 1.5,
      'B': 1.0,
      'C': 0.5,
      'D': 0.0,
    };
    return ratios[level] || 0.0;
  }

  async createPlan(data: Partial<PerformancePlan>): Promise<PerformancePlan> {
    const planNo = await this.generatePlanNo();
    const plan = this.planRepository.create({
      ...data,
      planNo,
      status: 0,
    });
    return this.planRepository.save(plan);
  }

  async updatePlan(id: string, data: Partial<PerformancePlan>): Promise<PerformancePlan> {
    const plan = await this.planRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!plan) throw new NotFoundException('绩效计划不存在');

    if (plan.status >= 1) {
      throw new BadRequestException('已发布的计划不允许修改');
    }

    Object.assign(plan, data);
    return this.planRepository.save(plan);
  }

  async publishPlan(id: string): Promise<PerformancePlan> {
    const plan = await this.planRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!plan) throw new NotFoundException('绩效计划不存在');

    if (plan.status !== 0) {
      throw new BadRequestException('只能发布草稿状态的计划');
    }

    plan.status = 1;
    return this.planRepository.save(plan);
  }

  async startSelfAssessment(id: string): Promise<PerformancePlan> {
    const plan = await this.planRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!plan) throw new NotFoundException('绩效计划不存在');

    if (plan.status !== 1) {
      throw new BadRequestException('只能对已发布的计划启动自评');
    }

    plan.status = 2;
    return this.planRepository.save(plan);
  }

  async startAssessment(id: string): Promise<PerformancePlan> {
    const plan = await this.planRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!plan) throw new NotFoundException('绩效计划不存在');

    if (plan.status !== 2) {
      throw new BadRequestException('只能对自评中的计划启动评估');
    }

    plan.status = 3;
    return this.planRepository.save(plan);
  }

  async startReview(id: string): Promise<PerformancePlan> {
    const plan = await this.planRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!plan) throw new NotFoundException('绩效计划不存在');

    if (plan.status !== 3) {
      throw new BadRequestException('只能对评估中的计划启动评审');
    }

    plan.status = 4;
    return this.planRepository.save(plan);
  }

  async completePlan(id: string): Promise<PerformancePlan> {
    const plan = await this.planRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!plan) throw new NotFoundException('绩效计划不存在');

    if (plan.status !== 4) {
      throw new BadRequestException('只能对评审中的计划完成');
    }

    plan.status = 5;
    return this.planRepository.save(plan);
  }

  async deletePlan(id: string): Promise<void> {
    const plan = await this.planRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!plan) throw new NotFoundException('绩效计划不存在');

    plan.isDeleted = 1;
    await this.planRepository.save(plan);
  }

  async findPlans(page = 1, pageSize = 20, status?: number): Promise<any> {
    const query = this.planRepository.createQueryBuilder('pp')
      .where('pp.isDeleted = 0');

    if (status !== undefined) {
      query.andWhere('pp.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('pp.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findPlanById(id: string): Promise<PerformancePlan | null> {
    return this.planRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async createResult(planId: string, empId: string, empName: string, departmentId: string, departmentName: string, positionId: string, positionName: string): Promise<PerformanceResult> {
    const plan = await this.planRepository.findOne({ where: { id: planId, isDeleted: 0 } });
    if (!plan) throw new NotFoundException('绩效计划不存在');

    const existing = await this.resultRepository.findOne({
      where: { planId, empId, isDeleted: 0 },
    });
    if (existing) {
      throw new BadRequestException('该员工已有评估结果');
    }

    const resultNo = await this.generateResultNo();
    const result = this.resultRepository.create({
      resultNo,
      planId,
      planNo: plan.planNo,
      planTitle: plan.title,
      empId,
      empName,
      departmentId,
      departmentName,
      positionId,
      positionName,
      status: 0,
    });
    return this.resultRepository.save(result);
  }

  async batchCreateResults(planId: string, employees: { empId: string; empName: string; departmentId: string; departmentName: string; positionId: string; positionName: string }[]): Promise<PerformanceResult[]> {
    const plan = await this.planRepository.findOne({ where: { id: planId, isDeleted: 0 } });
    if (!plan) throw new NotFoundException('绩效计划不存在');

    const results: PerformanceResult[] = [];
    for (const emp of employees) {
      const existing = await this.resultRepository.findOne({
        where: { planId, empId: emp.empId, isDeleted: 0 },
      });
      if (!existing) {
        const resultNo = await this.generateResultNo();
        const result = this.resultRepository.create({
          resultNo,
          planId,
          planNo: plan.planNo,
          planTitle: plan.title,
          ...emp,
          status: 0,
        });
        results.push(await this.resultRepository.save(result));
      }
    }
    return results;
  }

  async submitSelfAssessment(resultId: string, score: number, comment?: string): Promise<PerformanceResult> {
    const result = await this.resultRepository.findOne({ where: { id: resultId, isDeleted: 0 } });
    if (!result) throw new NotFoundException('评估结果不存在');

    if (result.status !== 0) {
      throw new BadRequestException('只能提交待自评状态的评估');
    }

    result.selfScore = score;
    result.selfComment = comment;
    result.status = 1;
    return this.resultRepository.save(result);
  }

  async submitSupervisorAssessment(resultId: string, score: number, comment?: string): Promise<PerformanceResult> {
    const result = await this.resultRepository.findOne({ where: { id: resultId, isDeleted: 0 } });
    if (!result) throw new NotFoundException('评估结果不存在');

    if (result.status !== 1) {
      throw new BadRequestException('只能评估已自评的结果');
    }

    result.supervisorScore = score;
    result.supervisorComment = comment;
    result.status = 3;
    return this.resultRepository.save(result);
  }

  async submitReview(resultId: string, finalScore?: number, improvementSuggestion?: string): Promise<PerformanceResult> {
    const result = await this.resultRepository.findOne({ where: { id: resultId, isDeleted: 0 } });
    if (!result) throw new NotFoundException('评估结果不存在');

    if (result.status !== 3) {
      throw new BadRequestException('只能评审已评估的结果');
    }

    if (finalScore) {
      result.finalScore = finalScore;
    } else {
      const avgScore = (Number(result.selfScore || 0) + Number(result.supervisorScore || 0)) / 2;
      result.finalScore = Math.round(avgScore * 100) / 100;
    }

    result.performanceLevel = this.calculatePerformanceLevel(result.finalScore);
    result.bonusRatio = this.calculateBonusRatio(result.performanceLevel);
    result.improvementSuggestion = improvementSuggestion;
    result.status = 5;
    return this.resultRepository.save(result);
  }

  async findResults(page = 1, pageSize = 20, planId?: string, empId?: string, status?: number): Promise<any> {
    const query = this.resultRepository.createQueryBuilder('pr')
      .where('pr.isDeleted = 0');

    if (planId) {
      query.andWhere('pr.planId = :planId', { planId });
    }
    if (empId) {
      query.andWhere('pr.empId = :empId', { empId });
    }
    if (status !== undefined) {
      query.andWhere('pr.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('pr.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async getStatistics(planId?: string): Promise<any> {
    const query = this.resultRepository.createQueryBuilder('pr')
      .where('pr.isDeleted = 0');

    if (planId) {
      query.andWhere('pr.planId = :planId', { planId });
    }

    const result = await query
      .select([
        'COUNT(*) as totalCount',
        'AVG(pr.finalScore) as avgScore',
        'SUM(CASE WHEN pr.performanceLevel = "S" THEN 1 ELSE 0 END) as sCount',
        'SUM(CASE WHEN pr.performanceLevel = "A" THEN 1 ELSE 0 END) as aCount',
        'SUM(CASE WHEN pr.performanceLevel = "B" THEN 1 ELSE 0 END) as bCount',
        'SUM(CASE WHEN pr.performanceLevel = "C" THEN 1 ELSE 0 END) as cCount',
        'SUM(CASE WHEN pr.performanceLevel = "D" THEN 1 ELSE 0 END) as dCount',
      ])
      .getRawOne();

    return {
      totalCount: result.totalCount || 0,
      avgScore: result.avgScore || 0,
      levelDistribution: {
        S: result.sCount || 0,
        A: result.aCount || 0,
        B: result.bCount || 0,
        C: result.cCount || 0,
        D: result.dCount || 0,
      },
    };
  }
}