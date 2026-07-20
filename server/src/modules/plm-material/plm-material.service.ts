import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlmMaterial } from '../../database/entities/plm-material.entity';

@Injectable()
export class PlmMaterialService {
  constructor(
    @InjectRepository(PlmMaterial)
    private materialRepository: Repository<PlmMaterial>,
  ) {}

  async generateMaterialCode(): Promise<string> {
    const now = new Date();
    const prefix = 'MT';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.materialRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async createMaterial(data: Partial<PlmMaterial>): Promise<PlmMaterial> {
    const materialCode = data.materialCode || await this.generateMaterialCode();
    
    const existing = await this.materialRepository.findOne({
      where: { materialCode, isDeleted: 0 },
    });
    if (existing) {
      throw new BadRequestException('物料编码已存在');
    }

    const material = this.materialRepository.create({
      ...data,
      materialCode,
      version: 'V1.0',
      status: 1,
    });

    return this.materialRepository.save(material);
  }

  async updateMaterial(id: string, data: Partial<PlmMaterial>): Promise<PlmMaterial> {
    const material = await this.materialRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!material) throw new NotFoundException('物料不存在');
    
    Object.assign(material, data);
    return this.materialRepository.save(material);
  }

  async retireMaterial(id: string): Promise<PlmMaterial> {
    const material = await this.materialRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!material) throw new NotFoundException('物料不存在');
    
    material.status = 2;
    return this.materialRepository.save(material);
  }

  async deleteMaterial(id: string): Promise<void> {
    const material = await this.materialRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!material) throw new NotFoundException('物料不存在');
    
    material.isDeleted = 1;
    await this.materialRepository.save(material);
  }

  async findMaterials(page = 1, pageSize = 20, materialType?: string, categoryCode?: string): Promise<any> {
    const query = this.materialRepository.createQueryBuilder('m')
      .where('m.isDeleted = 0');

    if (materialType) {
      query.andWhere('m.materialType = :materialType', { materialType });
    }
    if (categoryCode) {
      query.andWhere('m.categoryCode = :categoryCode', { categoryCode });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('m.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findMaterialById(id: string): Promise<PlmMaterial | null> {
    return this.materialRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findMaterialByCode(materialCode: string): Promise<PlmMaterial | null> {
    return this.materialRepository.findOne({ where: { materialCode, isDeleted: 0 } });
  }

  async findExpiringMaterials(days: number = 30): Promise<PlmMaterial[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    return this.materialRepository.find({
      where: {
        isDeleted: 0,
        status: 1,
        expiryDate: expiryDate,
      },
      order: { expiryDate: 'ASC' },
    });
  }

  async getMaterialStatistics(): Promise<any> {
    const totalMaterials = await this.materialRepository.count({ where: { isDeleted: 0 } });
    const activeMaterials = await this.materialRepository.count({ where: { isDeleted: 0, status: 1 } });
    const draftMaterials = await this.materialRepository.count({ where: { isDeleted: 0, status: 0 } });
    const retiredMaterials = await this.materialRepository.count({ where: { isDeleted: 0, status: 2 } });

    const typeStats = await this.materialRepository.createQueryBuilder('m')
      .select('m.materialType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('m.isDeleted = 0')
      .groupBy('m.materialType')
      .getRawMany();

    const categoryStats = await this.materialRepository.createQueryBuilder('m')
      .select('m.categoryCode', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('m.isDeleted = 0')
      .groupBy('m.categoryCode')
      .getRawMany();

    const serialCount = await this.materialRepository.count({ where: { isDeleted: 0, isSerial: 1 } });
    const batchCount = await this.materialRepository.count({ where: { isDeleted: 0, isBatch: 1 } });

    return {
      totalMaterials,
      activeMaterials,
      draftMaterials,
      retiredMaterials,
      serialCount,
      batchCount,
      typeStats,
      categoryStats,
    };
  }
}