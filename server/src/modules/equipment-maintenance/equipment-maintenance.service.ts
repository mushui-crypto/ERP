import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EquipmentMaintenance } from '../../database/entities/equipment-maintenance.entity';

@Injectable()
export class EquipmentMaintenanceService {
  constructor(
    @InjectRepository(EquipmentMaintenance)
    private equipmentMaintenanceRepository: Repository<EquipmentMaintenance>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.equipmentMaintenanceRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<EquipmentMaintenance | null> {
    return this.equipmentMaintenanceRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async create(data: Partial<EquipmentMaintenance>): Promise<EquipmentMaintenance> {
    const equipmentMaintenance = this.equipmentMaintenanceRepository.create(data);
    return this.equipmentMaintenanceRepository.save(equipmentMaintenance);
  }

  async update(id: string, data: Partial<EquipmentMaintenance>): Promise<EquipmentMaintenance> {
    const equipmentMaintenance = await this.findById(id);
    if (!equipmentMaintenance) throw new NotFoundException('保养记录不存在');
    Object.assign(equipmentMaintenance, data);
    return this.equipmentMaintenanceRepository.save(equipmentMaintenance);
  }

  async remove(id: string): Promise<void> {
    const equipmentMaintenance = await this.findById(id);
    if (!equipmentMaintenance) throw new NotFoundException('保养记录不存在');
    equipmentMaintenance.isDeleted = 1;
    await this.equipmentMaintenanceRepository.save(equipmentMaintenance);
  }
}
