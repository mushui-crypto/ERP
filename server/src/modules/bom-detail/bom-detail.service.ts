import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BomDetail } from '../../database/entities/bom-detail.entity';

@Injectable()
export class BomDetailService {
  constructor(
    @InjectRepository(BomDetail)
    private bomDetailRepository: Repository<BomDetail>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.bomDetailRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<BomDetail | null> {
    return this.bomDetailRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByBomId(bomId: string): Promise<BomDetail[]> {
    return this.bomDetailRepository.find({ where: { bomId, isDeleted: 0 } });
  }

  async create(data: Partial<BomDetail>): Promise<BomDetail> {
    const detail = this.bomDetailRepository.create(data);
    return this.bomDetailRepository.save(detail);
  }

  async update(id: string, data: Partial<BomDetail>): Promise<BomDetail> {
    const detail = await this.findById(id);
    if (!detail) throw new NotFoundException('BOM明细不存在');
    Object.assign(detail, data);
    return this.bomDetailRepository.save(detail);
  }

  async remove(id: string): Promise<void> {
    const detail = await this.findById(id);
    if (!detail) throw new NotFoundException('BOM明细不存在');
    detail.isDeleted = 1;
    await this.bomDetailRepository.save(detail);
  }
}
