import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlmEcn } from '../../database/entities/plm-ecn.entity';

@Injectable()
export class PlmEcnService {
  constructor(
    @InjectRepository(PlmEcn)
    private ecnRepository: Repository<PlmEcn>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.ecnRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<PlmEcn | null> {
    return this.ecnRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async create(data: Partial<PlmEcn>): Promise<PlmEcn> {
    const ecn = this.ecnRepository.create(data);
    return this.ecnRepository.save(ecn);
  }

  async update(id: string, data: Partial<PlmEcn>): Promise<PlmEcn> {
    const ecn = await this.findById(id);
    if (!ecn) throw new NotFoundException('PLM变更单不存在');
    Object.assign(ecn, data);
    return this.ecnRepository.save(ecn);
  }

  async remove(id: string): Promise<void> {
    const ecn = await this.findById(id);
    if (!ecn) throw new NotFoundException('PLM变更单不存在');
    ecn.isDeleted = 1;
    await this.ecnRepository.save(ecn);
  }
}
