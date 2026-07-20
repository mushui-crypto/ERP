import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Position } from '../../database/entities/position.entity';

@Injectable()
export class PositionService {
  constructor(
    @InjectRepository(Position)
    private positionRepository: Repository<Position>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.positionRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Position | null> {
    return this.positionRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByDeptId(deptId: string): Promise<Position[]> {
    return this.positionRepository.find({ where: { deptId, isDeleted: 0 } });
  }

  async create(data: Partial<Position>): Promise<Position> {
    const position = this.positionRepository.create(data);
    return this.positionRepository.save(position);
  }

  async update(id: string, data: Partial<Position>): Promise<Position> {
    const position = await this.findById(id);
    if (!position) throw new NotFoundException('岗位不存在');
    Object.assign(position, data);
    return this.positionRepository.save(position);
  }

  async remove(id: string): Promise<void> {
    const position = await this.findById(id);
    if (!position) throw new NotFoundException('岗位不存在');
    position.isDeleted = 1;
    await this.positionRepository.save(position);
  }
}
