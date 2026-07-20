import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment } from '../../database/entities/equipment.entity';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.equipmentRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Equipment | null> {
    return this.equipmentRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async create(data: Partial<Equipment>): Promise<Equipment> {
    const equipment = this.equipmentRepository.create(data);
    return this.equipmentRepository.save(equipment);
  }

  async update(id: string, data: Partial<Equipment>): Promise<Equipment> {
    const equipment = await this.findById(id);
    if (!equipment) throw new NotFoundException('设备不存在');
    Object.assign(equipment, data);
    return this.equipmentRepository.save(equipment);
  }

  async remove(id: string): Promise<void> {
    const equipment = await this.findById(id);
    if (!equipment) throw new NotFoundException('设备不存在');
    equipment.isDeleted = 1;
    await this.equipmentRepository.save(equipment);
  }
}
