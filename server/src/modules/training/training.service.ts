import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TrainingPlan } from '../../database/entities/training-plan.entity';
import { TrainingRecord } from '../../database/entities/training-record.entity';

@Injectable()
export class TrainingService {
  constructor(
    @InjectRepository(TrainingPlan)
    private planRepository: Repository<TrainingPlan>,
    @InjectRepository(TrainingRecord)
    private recordRepository: Repository<TrainingRecord>,
  ) {}

  async generatePlanNo(): Promise<string> {
    const now = new Date();
    const prefix = 'TP';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.planRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async generateRecordNo(): Promise<string> {
    const now = new Date();
    const prefix = 'TR';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.recordRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async createPlan(data: Partial<TrainingPlan>): Promise<TrainingPlan> {
    const planNo = await this.generatePlanNo();
    const plan = this.planRepository.create({
      ...data,
      planNo,
      actualCount: 0,
      actualCost: 0,
      status: 0,
    });
    return this.planRepository.save(plan);
  }

  async updatePlan(id: string, data: Partial<TrainingPlan>): Promise<TrainingPlan> {
    const plan = await this.planRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!plan) throw new NotFoundException('培训计划不存在');

    if (plan.status >= 2) {
      throw new BadRequestException('已批准的计划不允许修改');
    }

    Object.assign(plan, data);
    return this.planRepository.save(plan);
  }

  async submitPlan(id: string): Promise<TrainingPlan> {
    const plan = await this.planRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!plan) throw new NotFoundException('培训计划不存在');

    if (plan.status !== 0) {
      throw new BadRequestException('只能提交草稿状态的计划');
    }

    plan.status = 1;
    return this.planRepository.save(plan);
  }

  async approvePlan(id: string): Promise<TrainingPlan> {
    const plan = await this.planRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!plan) throw new NotFoundException('培训计划不存在');

    if (plan.status !== 1) {
      throw new BadRequestException('只能审核待审核状态的计划');
    }

    plan.status = 2;
    return this.planRepository.save(plan);
  }

  async startPlan(id: string): Promise<TrainingPlan> {
    const plan = await this.planRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!plan) throw new NotFoundException('培训计划不存在');

    if (plan.status !== 2) {
      throw new BadRequestException('只能启动已批准的计划');
    }

    plan.status = 3;
    return this.planRepository.save(plan);
  }

  async completePlan(id: string): Promise<TrainingPlan> {
    const plan = await this.planRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!plan) throw new NotFoundException('培训计划不存在');

    if (plan.status !== 3) {
      throw new BadRequestException('只能完成进行中的计划');
    }

    plan.status = 4;
    return this.planRepository.save(plan);
  }

  async cancelPlan(id: string): Promise<TrainingPlan> {
    const plan = await this.planRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!plan) throw new NotFoundException('培训计划不存在');

    if (plan.status === 4) {
      throw new BadRequestException('已完成的计划不允许取消');
    }

    plan.status = 5;
    return this.planRepository.save(plan);
  }

  async deletePlan(id: string): Promise<void> {
    const plan = await this.planRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!plan) throw new NotFoundException('培训计划不存在');

    plan.isDeleted = 1;
    await this.planRepository.save(plan);
  }

  async findPlans(page = 1, pageSize = 20, status?: number): Promise<any> {
    const query = this.planRepository.createQueryBuilder('tp')
      .where('tp.isDeleted = 0');

    if (status !== undefined) {
      query.andWhere('tp.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('tp.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findPlanById(id: string): Promise<TrainingPlan | null> {
    return this.planRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async enrollEmployee(planId: string, empId: string, empName: string, departmentId: string, departmentName: string): Promise<TrainingRecord> {
    const plan = await this.planRepository.findOne({ where: { id: planId, isDeleted: 0 } });
    if (!plan) throw new NotFoundException('培训计划不存在');

    const existing = await this.recordRepository.findOne({
      where: { planId, empId, isDeleted: 0 },
    });
    if (existing) {
      throw new BadRequestException('该员工已报名');
    }

    const recordNo = await this.generateRecordNo();
    const record = this.recordRepository.create({
      recordNo,
      planId,
      planNo: plan.planNo,
      planTitle: plan.title,
      empId,
      empName,
      departmentId,
      departmentName,
      attendanceStatus: 0,
      status: 0,
    });

    const result = await this.recordRepository.save(record);

    plan.actualCount += 1;
    await this.planRepository.save(plan);

    return result;
  }

  async batchEnroll(planId: string, employees: { empId: string; empName: string; departmentId: string; departmentName: string }[]): Promise<TrainingRecord[]> {
    const plan = await this.planRepository.findOne({ where: { id: planId, isDeleted: 0 } });
    if (!plan) throw new NotFoundException('培训计划不存在');

    const results: TrainingRecord[] = [];
    for (const emp of employees) {
      const existing = await this.recordRepository.findOne({
        where: { planId, empId: emp.empId, isDeleted: 0 },
      });
      if (!existing) {
        const recordNo = await this.generateRecordNo();
        const record = this.recordRepository.create({
          recordNo,
          planId,
          planNo: plan.planNo,
          planTitle: plan.title,
          ...emp,
          attendanceStatus: 0,
          status: 0,
        });
        results.push(await this.recordRepository.save(record));
      }
    }

    plan.actualCount += results.length;
    await this.planRepository.save(plan);

    return results;
  }

  async updateAttendance(recordId: string, attendanceStatus: number): Promise<TrainingRecord> {
    const record = await this.recordRepository.findOne({ where: { id: recordId, isDeleted: 0 } });
    if (!record) throw new NotFoundException('培训记录不存在');

    record.attendanceStatus = attendanceStatus;
    record.status = attendanceStatus === 1 ? 1 : 0;
    return this.recordRepository.save(record);
  }

  async updateTestScore(recordId: string, score: number, feedback?: string): Promise<TrainingRecord> {
    const record = await this.recordRepository.findOne({ where: { id: recordId, isDeleted: 0 } });
    if (!record) throw new NotFoundException('培训记录不存在');

    record.testScore = score;
    record.feedback = feedback;
    record.status = 2;
    return this.recordRepository.save(record);
  }

  async findRecords(page = 1, pageSize = 20, planId?: string, empId?: string): Promise<any> {
    const query = this.recordRepository.createQueryBuilder('tr')
      .where('tr.isDeleted = 0');

    if (planId) {
      query.andWhere('tr.planId = :planId', { planId });
    }
    if (empId) {
      query.andWhere('tr.empId = :empId', { empId });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('tr.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async getStatistics(): Promise<any> {
    const totalPlans = await this.planRepository.count({ where: { isDeleted: 0 } });
    const completedPlans = await this.planRepository.count({ where: { isDeleted: 0, status: 4 } });
    const inProgressPlans = await this.planRepository.count({ where: { isDeleted: 0, status: 3 } });

    const totalRecords = await this.recordRepository.count({ where: { isDeleted: 0 } });
    const completedRecords = await this.recordRepository.count({ where: { isDeleted: 0, status: 2 } });

    const result = await this.planRepository.createQueryBuilder('tp')
      .select('SUM(tp.budget) as totalBudget, SUM(tp.actualCost) as totalCost')
      .where('tp.isDeleted = 0')
      .getRawOne();

    const scoreResult = await this.recordRepository.createQueryBuilder('tr')
      .select('AVG(tr.testScore) as avgScore')
      .where('tr.isDeleted = 0 AND tr.testScore IS NOT NULL')
      .getRawOne();

    return {
      totalPlans,
      completedPlans,
      inProgressPlans,
      totalRecords,
      completedRecords,
      completionRate: totalRecords > 0 ? (completedRecords / totalRecords * 100).toFixed(2) : '0.00',
      totalBudget: result.totalBudget || 0,
      totalCost: result.totalCost || 0,
      avgScore: scoreResult.avgScore || 0,
    };
  }
}