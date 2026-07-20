import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QualityUnqualified } from '../../database/entities/quality-unqualified.entity';
import { QualityInspection } from '../../database/entities/quality-inspection.entity';

@Injectable()
export class QualityUnqualifiedService {
  constructor(
    @InjectRepository(QualityUnqualified)
    private qualityUnqualifiedRepository: Repository<QualityUnqualified>,
    @InjectRepository(QualityInspection)
    private qualityInspectionRepository: Repository<QualityInspection>,
  ) {}

  async findAll(page = 1, pageSize = 20, unqualifiedNo?: string, materialCode?: string, status?: number) {
    const query = this.qualityUnqualifiedRepository.createQueryBuilder('qu')
      .where('qu.isDeleted = 0');

    if (unqualifiedNo) {
      query.andWhere('qu.unqualifiedNo LIKE :unqualifiedNo', { unqualifiedNo: `%${unqualifiedNo}%` });
    }
    if (materialCode) {
      query.andWhere('qu.materialCode LIKE :materialCode', { materialCode: `%${materialCode}%` });
    }
    if (status !== undefined) {
      query.andWhere('qu.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('qu.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<QualityUnqualified | null> {
    return this.qualityUnqualifiedRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByInspectionId(inspectionId: string): Promise<QualityUnqualified[]> {
    return this.qualityUnqualifiedRepository.find({ where: { inspectionId, isDeleted: 0 } });
  }

  async generateUnqualifiedNo(): Promise<string> {
    const now = new Date();
    const prefix = 'UQ';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.qualityUnqualifiedRepository.count({
      where: { isDeleted: 0 },
    });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async create(data: Partial<QualityUnqualified>): Promise<QualityUnqualified> {
    const unqualifiedNo = await this.generateUnqualifiedNo();
    
    const inspection = await this.qualityInspectionRepository.findOne({
      where: { id: data.inspectionId, isDeleted: 0 },
    });
    if (!inspection) {
      throw new NotFoundException('关联检验单不存在');
    }

    const unqualified = this.qualityUnqualifiedRepository.create({
      ...data,
      unqualifiedNo,
      inspectionNo: inspection.inspectionNo,
      status: 0,
    });
    return this.qualityUnqualifiedRepository.save(unqualified);
  }

  async update(id: string, data: Partial<QualityUnqualified>): Promise<QualityUnqualified> {
    const unqualified = await this.findById(id);
    if (!unqualified) throw new NotFoundException('不合格单不存在');

    if (unqualified.status >= 2) {
      throw new BadRequestException('已完成的不合格单不允许修改');
    }

    Object.assign(unqualified, data);
    return this.qualityUnqualifiedRepository.save(unqualified);
  }

  async remove(id: string): Promise<void> {
    const unqualified = await this.findById(id);
    if (!unqualified) throw new NotFoundException('不合格单不存在');

    unqualified.isDeleted = 1;
    await this.qualityUnqualifiedRepository.save(unqualified);
  }

  async dispose(id: string, disposalMethod: number, disposalQty: number, disposalPerson: string): Promise<QualityUnqualified> {
    const unqualified = await this.findById(id);
    if (!unqualified) throw new NotFoundException('不合格单不存在');

    if (unqualified.status !== 0) {
      throw new BadRequestException('只能处理待处理状态的不合格单');
    }

    if (disposalQty > unqualified.unqualifiedQty) {
      throw new BadRequestException('处理数量不能大于不合格数量');
    }

    unqualified.disposalMethod = disposalMethod;
    unqualified.disposalQty = disposalQty;
    unqualified.disposalPerson = disposalPerson;
    unqualified.disposalDate = new Date();
    unqualified.status = 1;

    return this.qualityUnqualifiedRepository.save(unqualified);
  }

  async complete(id: string, correctiveAction?: string, preventiveAction?: string): Promise<QualityUnqualified> {
    const unqualified = await this.findById(id);
    if (!unqualified) throw new NotFoundException('不合格单不存在');

    if (unqualified.status !== 1) {
      throw new BadRequestException('只能完成处理中的不合格单');
    }

    unqualified.status = 2;
    unqualified.correctiveAction = correctiveAction;
    unqualified.preventiveAction = preventiveAction;

    return this.qualityUnqualifiedRepository.save(unqualified);
  }

  async close(id: string): Promise<QualityUnqualified> {
    const unqualified = await this.findById(id);
    if (!unqualified) throw new NotFoundException('不合格单不存在');

    if (unqualified.status !== 2) {
      throw new BadRequestException('只能关闭已完成的不合格单');
    }

    unqualified.status = 3;
    return this.qualityUnqualifiedRepository.save(unqualified);
  }

  async getStatistics(period?: string): Promise<any> {
    const query = this.qualityUnqualifiedRepository.createQueryBuilder('qu')
      .where('qu.isDeleted = 0');

    if (period === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      query.andWhere('qu.createdAt >= :startOfMonth', { startOfMonth });
    } else if (period === 'quarter') {
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
      query.andWhere('qu.createdAt >= :startOfQuarter', { startOfQuarter });
    }

    const total = await query.getCount();
    const byDisposalMethod = await query
      .select('qu.disposal_method', 'method')
      .addSelect('COUNT(*)', 'count')
      .groupBy('qu.disposal_method')
      .getRawMany();

    const totalQty = await query
      .select('SUM(qu.unqualified_qty)', 'total')
      .getRawOne();

    return {
      totalUnqualified: total,
      totalUnqualifiedQty: Number(totalQty.total) || 0,
      byDisposalMethod: byDisposalMethod.map(item => ({
        method: Number(item.method),
        count: Number(item.count),
      })),
    };
  }
}