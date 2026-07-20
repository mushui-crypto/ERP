import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QualityStandard } from '../../database/entities/quality-standard.entity';
import { QualityItem } from '../../database/entities/quality-item.entity';

@Injectable()
export class QualityStandardService {
  constructor(
    @InjectRepository(QualityStandard)
    private qualityStandardRepository: Repository<QualityStandard>,
    @InjectRepository(QualityItem)
    private qualityItemRepository: Repository<QualityItem>,
  ) {}

  async findAll(page = 1, pageSize = 20, standardCode?: string, materialId?: string) {
    const query = this.qualityStandardRepository.createQueryBuilder('qs')
      .where('qs.isDeleted = 0');

    if (standardCode) {
      query.andWhere('qs.standardCode LIKE :standardCode', { standardCode: `%${standardCode}%` });
    }
    if (materialId) {
      query.andWhere('qs.materialId = :materialId', { materialId });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('qs.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<QualityStandard | null> {
    return this.qualityStandardRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findWithItems(id: string): Promise<{ standard: QualityStandard; items: QualityItem[] } | null> {
    const standard = await this.findById(id);
    if (!standard) return null;

    const items = await this.qualityItemRepository.find({
      where: { standardId: id, isDeleted: 0 },
      order: { sortOrder: 'ASC' },
    });

    return { standard, items };
  }

  async findByMaterialId(materialId: string): Promise<QualityStandard[]> {
    return this.qualityStandardRepository.find({ where: { materialId, isDeleted: 0, status: 1 } });
  }

  async generateStandardCode(): Promise<string> {
    const now = new Date();
    const prefix = 'QS';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.qualityStandardRepository.count({
      where: { isDeleted: 0 },
    });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async create(data: Partial<QualityStandard>, items: Partial<QualityItem>[]): Promise<QualityStandard> {
    const existing = await this.qualityStandardRepository.findOne({
      where: { standardCode: data.standardCode, isDeleted: 0 },
    });
    if (existing) {
      throw new BadRequestException('标准编码已存在');
    }

    const standard = this.qualityStandardRepository.create({
      ...data,
      standardCode: data.standardCode || await this.generateStandardCode(),
    });
    const savedStandard = await this.qualityStandardRepository.save(standard);

    if (items && items.length > 0) {
      const itemEntities = items.map((item, index) => ({
        ...item,
        standardId: savedStandard.id,
        sortOrder: item.sortOrder !== undefined ? item.sortOrder : index,
      }));
      await this.qualityItemRepository.save(itemEntities);
    }

    return savedStandard;
  }

  async update(id: string, data: Partial<QualityStandard>): Promise<QualityStandard> {
    const standard = await this.findById(id);
    if (!standard) throw new NotFoundException('检验标准不存在');

    Object.assign(standard, data);
    return this.qualityStandardRepository.save(standard);
  }

  async remove(id: string): Promise<void> {
    const standard = await this.findById(id);
    if (!standard) throw new NotFoundException('检验标准不存在');

    standard.isDeleted = 1;
    await this.qualityStandardRepository.save(standard);

    await this.qualityItemRepository.update(
      { standardId: id },
      { isDeleted: 1 },
    );
  }

  async addItems(standardId: string, items: Partial<QualityItem>[]): Promise<QualityItem[]> {
    const standard = await this.findById(standardId);
    if (!standard) throw new NotFoundException('检验标准不存在');

    const itemEntities = items.map((item, index) => ({
      ...item,
      standardId,
      sortOrder: item.sortOrder !== undefined ? item.sortOrder : index,
    }));

    return this.qualityItemRepository.save(itemEntities);
  }

  async updateItem(itemId: string, data: Partial<QualityItem>): Promise<QualityItem> {
    const item = await this.qualityItemRepository.findOne({ where: { id: itemId, isDeleted: 0 } });
    if (!item) throw new NotFoundException('检验项目不存在');

    Object.assign(item, data);
    return this.qualityItemRepository.save(item);
  }

  async removeItem(itemId: string): Promise<void> {
    const item = await this.qualityItemRepository.findOne({ where: { id: itemId, isDeleted: 0 } });
    if (!item) throw new NotFoundException('检验项目不存在');

    item.isDeleted = 1;
    await this.qualityItemRepository.save(item);
  }
}