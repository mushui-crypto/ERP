import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecruitmentRequirement } from '../../database/entities/recruitment-requirement.entity';
import { RecruitmentCandidate } from '../../database/entities/recruitment-candidate.entity';
import { RecruitmentInterview } from '../../database/entities/recruitment-interview.entity';

@Injectable()
export class RecruitmentService {
  constructor(
    @InjectRepository(RecruitmentRequirement)
    private requirementRepository: Repository<RecruitmentRequirement>,
    @InjectRepository(RecruitmentCandidate)
    private candidateRepository: Repository<RecruitmentCandidate>,
    @InjectRepository(RecruitmentInterview)
    private interviewRepository: Repository<RecruitmentInterview>,
  ) {}

  async generateRequirementNo(): Promise<string> {
    const now = new Date();
    const prefix = 'RR';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.requirementRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async generateCandidateNo(): Promise<string> {
    const now = new Date();
    const prefix = 'RC';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.candidateRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async generateInterviewNo(): Promise<string> {
    const now = new Date();
    const prefix = 'RI';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.interviewRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async createRequirement(data: Partial<RecruitmentRequirement>): Promise<RecruitmentRequirement> {
    const requirementNo = await this.generateRequirementNo();
    const requirement = this.requirementRepository.create({
      ...data,
      requirementNo,
      hiredCount: 0,
      status: 0,
    });
    return this.requirementRepository.save(requirement);
  }

  async updateRequirement(id: string, data: Partial<RecruitmentRequirement>): Promise<RecruitmentRequirement> {
    const requirement = await this.requirementRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!requirement) throw new NotFoundException('招聘需求不存在');

    if (requirement.status >= 2) {
      throw new BadRequestException('已批准的需求不允许修改');
    }

    Object.assign(requirement, data);
    return this.requirementRepository.save(requirement);
  }

  async submitRequirement(id: string): Promise<RecruitmentRequirement> {
    const requirement = await this.requirementRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!requirement) throw new NotFoundException('招聘需求不存在');

    if (requirement.status !== 0) {
      throw new BadRequestException('只能提交草稿状态的需求');
    }

    requirement.status = 1;
    return this.requirementRepository.save(requirement);
  }

  async approveRequirement(id: string): Promise<RecruitmentRequirement> {
    const requirement = await this.requirementRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!requirement) throw new NotFoundException('招聘需求不存在');

    if (requirement.status !== 1) {
      throw new BadRequestException('只能审核待审核状态的需求');
    }

    requirement.status = 2;
    return this.requirementRepository.save(requirement);
  }

  async startRecruitment(id: string): Promise<RecruitmentRequirement> {
    const requirement = await this.requirementRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!requirement) throw new NotFoundException('招聘需求不存在');

    if (requirement.status !== 2) {
      throw new BadRequestException('只能启动已批准的需求');
    }

    requirement.status = 3;
    return this.requirementRepository.save(requirement);
  }

  async completeRequirement(id: string): Promise<RecruitmentRequirement> {
    const requirement = await this.requirementRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!requirement) throw new NotFoundException('招聘需求不存在');

    if (requirement.status !== 3) {
      throw new BadRequestException('只能完成招聘中的需求');
    }

    if (requirement.hiredCount < requirement.headcount) {
      throw new BadRequestException('招聘人数未达标，不能完成');
    }

    requirement.status = 4;
    return this.requirementRepository.save(requirement);
  }

  async cancelRequirement(id: string): Promise<RecruitmentRequirement> {
    const requirement = await this.requirementRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!requirement) throw new NotFoundException('招聘需求不存在');

    if (requirement.status === 4) {
      throw new BadRequestException('已完成的需求不允许取消');
    }

    requirement.status = 5;
    return this.requirementRepository.save(requirement);
  }

  async deleteRequirement(id: string): Promise<void> {
    const requirement = await this.requirementRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!requirement) throw new NotFoundException('招聘需求不存在');

    requirement.isDeleted = 1;
    await this.requirementRepository.save(requirement);
  }

  async findRequirements(page = 1, pageSize = 20, status?: number): Promise<any> {
    const query = this.requirementRepository.createQueryBuilder('rr')
      .where('rr.isDeleted = 0');

    if (status !== undefined) {
      query.andWhere('rr.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('rr.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findRequirementById(id: string): Promise<RecruitmentRequirement | null> {
    return this.requirementRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async createCandidate(data: Partial<RecruitmentCandidate>): Promise<RecruitmentCandidate> {
    const candidateNo = await this.generateCandidateNo();
    
    const requirement = await this.requirementRepository.findOne({
      where: { id: data.requirementId, isDeleted: 0 },
    });

    const candidate = this.candidateRepository.create({
      ...data,
      candidateNo,
      requirementNo: requirement?.requirementNo,
      status: 0,
    });
    return this.candidateRepository.save(candidate);
  }

  async updateCandidate(id: string, data: Partial<RecruitmentCandidate>): Promise<RecruitmentCandidate> {
    const candidate = await this.candidateRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!candidate) throw new NotFoundException('候选人不存在');

    Object.assign(candidate, data);
    return this.candidateRepository.save(candidate);
  }

  async screenCandidate(id: string, result: number): Promise<RecruitmentCandidate> {
    const candidate = await this.candidateRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!candidate) throw new NotFoundException('候选人不存在');

    candidate.status = result;
    return this.candidateRepository.save(candidate);
  }

  async hireCandidate(id: string): Promise<RecruitmentCandidate> {
    const candidate = await this.candidateRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!candidate) throw new NotFoundException('候选人不存在');

    if (candidate.status !== 2) {
      throw new BadRequestException('只能录用面试中的候选人');
    }

    candidate.status = 3;
    
    const requirement = await this.requirementRepository.findOne({
      where: { id: candidate.requirementId, isDeleted: 0 },
    });
    if (requirement) {
      requirement.hiredCount += 1;
      await this.requirementRepository.save(requirement);
    }

    return this.candidateRepository.save(candidate);
  }

  async rejectCandidate(id: string): Promise<RecruitmentCandidate> {
    const candidate = await this.candidateRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!candidate) throw new NotFoundException('候选人不存在');

    candidate.status = 4;
    return this.candidateRepository.save(candidate);
  }

  async confirmOnboard(id: string): Promise<RecruitmentCandidate> {
    const candidate = await this.candidateRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!candidate) throw new NotFoundException('候选人不存在');

    if (candidate.status !== 3) {
      throw new BadRequestException('只能确认已录用的候选人入职');
    }

    candidate.status = 5;
    return this.candidateRepository.save(candidate);
  }

  async findCandidates(page = 1, pageSize = 20, requirementId?: string, status?: number): Promise<any> {
    const query = this.candidateRepository.createQueryBuilder('rc')
      .where('rc.isDeleted = 0');

    if (requirementId) {
      query.andWhere('rc.requirementId = :requirementId', { requirementId });
    }
    if (status !== undefined) {
      query.andWhere('rc.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('rc.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async createInterview(data: Partial<RecruitmentInterview>): Promise<RecruitmentInterview> {
    const interviewNo = await this.generateInterviewNo();
    
    const candidate = await this.candidateRepository.findOne({
      where: { id: data.candidateId, isDeleted: 0 },
    });

    const interview = this.interviewRepository.create({
      ...data,
      interviewNo,
      candidateName: candidate?.name,
      positionName: candidate?.positionName,
      status: 0,
    });
    return this.interviewRepository.save(interview);
  }

  async completeInterview(id: string, result: number, score?: number, comment?: string): Promise<RecruitmentInterview> {
    const interview = await this.interviewRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!interview) throw new NotFoundException('面试记录不存在');

    interview.interviewResult = result;
    interview.evaluationScore = score;
    interview.evaluationComment = comment;
    interview.status = 1;
    
    await this.interviewRepository.save(interview);

    if (result === 1) {
      const candidate = await this.candidateRepository.findOne({
        where: { id: interview.candidateId, isDeleted: 0 },
      });
      if (candidate) {
        if (interview.interviewRound >= 3) {
          candidate.status = 3;
        } else {
          candidate.status = 2;
        }
        await this.candidateRepository.save(candidate);
      }
    } else if (result === 3) {
      const candidate = await this.candidateRepository.findOne({
        where: { id: interview.candidateId, isDeleted: 0 },
      });
      if (candidate) {
        candidate.status = 4;
        await this.candidateRepository.save(candidate);
      }
    }

    return interview;
  }

  async findInterviews(page = 1, pageSize = 20, candidateId?: string): Promise<any> {
    const query = this.interviewRepository.createQueryBuilder('ri')
      .where('ri.isDeleted = 0');

    if (candidateId) {
      query.andWhere('ri.candidateId = :candidateId', { candidateId });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('ri.interviewDate', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async getStatistics(): Promise<any> {
    const totalRequirements = await this.requirementRepository.count({ where: { isDeleted: 0 } });
    const activeRequirements = await this.requirementRepository.count({ where: { isDeleted: 0, status: 3 } });
    
    const totalCandidates = await this.candidateRepository.count({ where: { isDeleted: 0 } });
    const hiredCandidates = await this.candidateRepository.count({ where: { isDeleted: 0, status: 5 } });

    const totalInterviews = await this.interviewRepository.count({ where: { isDeleted: 0 } });
    const passedInterviews = await this.interviewRepository.count({ where: { isDeleted: 0, interviewResult: 1 } });

    return {
      totalRequirements,
      activeRequirements,
      totalCandidates,
      hiredCandidates,
      totalInterviews,
      passedInterviews,
      hireRate: totalCandidates > 0 ? (hiredCandidates / totalCandidates * 100).toFixed(2) : '0.00',
      passRate: totalInterviews > 0 ? (passedInterviews / totalInterviews * 100).toFixed(2) : '0.00',
    };
  }
}