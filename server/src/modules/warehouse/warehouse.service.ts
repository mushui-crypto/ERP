import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from '../../database/entities/warehouse.entity';
import { CreateWarehouseDto, UpdateWarehouseDto } from './dto/warehouse.dto';

@Injectable()
export class WarehouseService {
  constructor(
    @InjectRepository(Warehouse)
    private warehouseRepository: Repository<Warehouse>,
  ) {}

  async findAll(page = 1, pageSize = 20, warehouseType?: number) {
    const where: any = { isDeleted: 0 };
    if (warehouseType !== undefined) where.warehouseType = warehouseType;
    
    const [list, total] = await this.warehouseRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Warehouse | null> {
    return this.warehouseRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByCode(warehouseCode: string): Promise<Warehouse | null> {
    return this.warehouseRepository.findOne({ where: { warehouseCode, isDeleted: 0 } });
  }

  async findTree(): Promise<any[]> {
    const all = await this.warehouseRepository.find({
      where: { isDeleted: 0, status: 1 },
      order: { createdAt: 'DESC' },
    });

    const map = new Map<string, any>();
    const result: any[] = [];

    all.forEach(item => {
      map.set(item.id, { ...item, children: [] });
    });

    all.forEach(item => {
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId).children.push(map.get(item.id));
      } else {
        result.push(map.get(item.id));
      }
    });

    return result;
  }

  async create(data: CreateWarehouseDto): Promise<Warehouse> {
    const existing = await this.findByCode(data.warehouseCode);
    if (existing) throw new ConflictException('仓库编码已存在');

    if (data.isDefault) {
      await this.warehouseRepository.update(
        { isDefault: 1, isDeleted: 0 },
        { isDefault: 0 },
      );
    }
    
    const entity = this.warehouseRepository.create(data);
    return this.warehouseRepository.save(entity);
  }

  async update(id: string, data: UpdateWarehouseDto): Promise<Warehouse> {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException('仓库不存在');
    
    if (data.isDefault && entity.isDefault !== 1) {
      await this.warehouseRepository.update(
        { isDefault: 1, isDeleted: 0 },
        { isDefault: 0 },
      );
    }
    
    Object.assign(entity, data);
    return this.warehouseRepository.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException('仓库不存在');
    
    entity.isDeleted = 1;
    await this.warehouseRepository.save(entity);
  }
}