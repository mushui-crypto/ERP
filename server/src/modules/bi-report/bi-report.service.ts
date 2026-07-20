import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BiReport } from '../../database/entities/bi-report.entity';

@Injectable()
export class BiReportService {
  constructor(
    @InjectRepository(BiReport)
    private biReportRepository: Repository<BiReport>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.biReportRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<BiReport | null> {
    return this.biReportRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async create(data: Partial<BiReport>): Promise<BiReport> {
    const biReport = this.biReportRepository.create(data);
    return this.biReportRepository.save(biReport);
  }

  async update(id: string, data: Partial<BiReport>): Promise<BiReport> {
    const biReport = await this.findById(id);
    if (!biReport) throw new NotFoundException('BI报表不存在');
    Object.assign(biReport, data);
    return this.biReportRepository.save(biReport);
  }

  async remove(id: string): Promise<void> {
    const biReport = await this.findById(id);
    if (!biReport) throw new NotFoundException('BI报表不存在');
    biReport.isDeleted = 1;
    await this.biReportRepository.save(biReport);
  }
}
