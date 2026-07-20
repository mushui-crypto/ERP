import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Unit } from '../../database/entities/unit.entity';
import { CreateUnitDto, UpdateUnitDto } from './dto/unit.dto';

@Injectable()
export class UnitService {
  constructor(
    @InjectRepository(Unit)
    private unitRepository: Repository<Unit>,
  ) {}

  async findAll(page = 1, pageSize = 20, unitType?: number) {
    const where: any = { isDeleted: 0 };
    if (unitType !== undefined) where.unitType = unitType;
    
    const [list, total] = await this.unitRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Unit | null> {
    return this.unitRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByCode(unitCode: string): Promise<Unit | null> {
    return this.unitRepository.findOne({ where: { unitCode, isDeleted: 0 } });
  }

  async create(data: CreateUnitDto): Promise<Unit> {
    const existing = await this.findByCode(data.unitCode);
    if (existing) throw new ConflictException('计量单位编码已存在');
    
    const entity = this.unitRepository.create(data);
    return this.unitRepository.save(entity);
  }

  async update(id: string, data: UpdateUnitDto): Promise<Unit> {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException('计量单位不存在');
    
    Object.assign(entity, data);
    return this.unitRepository.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException('计量单位不存在');
    
    entity.isDeleted = 1;
    await this.unitRepository.save(entity);
  }
}