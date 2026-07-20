﻿import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Bom } from '../../database/entities/bom.entity';
import { BomDetail } from '../../database/entities/bom-detail.entity';

@Injectable()
export class BomService {
  constructor(
    @InjectRepository(Bom)
    private bomRepository: Repository<Bom>,
    @InjectRepository(BomDetail)
    private bomDetailRepository: Repository<BomDetail>,
  ) {}

  async findAll(page = 1, pageSize = 20, bomNo?: string, materialId?: string) {
    const query = this.bomRepository.createQueryBuilder('bom')
      .where('bom.isDeleted = 0');

    if (bomNo) {
      query.andWhere('bom.bomNo LIKE :bomNo', { bomNo: `%${bomNo}%` });
    }
    if (materialId) {
      query.andWhere('bom.materialId = :materialId', { materialId });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('bom.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Bom | null> {
    return this.bomRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByMaterialId(materialId: string): Promise<Bom[]> {
    return this.bomRepository.find({ where: { materialId, isDeleted: 0 } });
  }

  async findDefaultByMaterialId(materialId: string): Promise<Bom | null> {
    return this.bomRepository.findOne({ 
      where: { materialId, isDeleted: 0, isDefault: 1, status: 1 } 
    });
  }

  async findWithDetails(id: string): Promise<{ bom: Bom; details: BomDetail[] } | null> {
    const bom = await this.findById(id);
    if (!bom) return null;

    const details = await this.bomDetailRepository.find({
      where: { bomId: id, isDeleted: 0 },
      order: { createdAt: 'ASC' },
    });

    return { bom, details };
  }

  async generateBomNo(): Promise<string> {
    const now = new Date();
    const prefix = 'BOM';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.bomRepository.count({
      where: { isDeleted: 0 },
    });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async create(data: Partial<Bom>, details: Partial<BomDetail>[]): Promise<Bom> {
    const existing = await this.bomRepository.findOne({
      where: { materialId: data.materialId, version: data.version || '1.0', isDeleted: 0 },
    });
    if (existing) {
      throw new BadRequestException('该物料已存在相同版本的BOM');
    }

    const bomNo = await this.generateBomNo();
    const bom = this.bomRepository.create({
      ...data,
      bomNo,
      version: data.version || '1.0',
      isDefault: data.isDefault !== undefined ? data.isDefault : 1,
    });
    const savedBom = await this.bomRepository.save(bom);

    if (details && details.length > 0) {
      const detailEntities = details.map(d => ({
        ...d,
        bomId: savedBom.id,
      }));
      await this.bomDetailRepository.save(detailEntities);
    }

    if (bom.isDefault === 1) {
      await this.bomRepository.update(
        { materialId: data.materialId, id: savedBom.id },
        { isDefault: 0 },
      );
    }

    return savedBom;
  }

  async update(id: string, data: Partial<Bom>): Promise<Bom> {
    const bom = await this.findById(id);
    if (!bom) throw new NotFoundException('BOM不存在');

    Object.assign(bom, data);
    return this.bomRepository.save(bom);
  }

  async remove(id: string): Promise<void> {
    const bom = await this.findById(id);
    if (!bom) throw new NotFoundException('BOM不存在');

    bom.isDeleted = 1;
    await this.bomRepository.save(bom);

    await this.bomDetailRepository.update(
      { bomId: id },
      { isDeleted: 1 },
    );
  }

  async setDefault(id: string): Promise<Bom> {
    const bom = await this.findById(id);
    if (!bom) throw new NotFoundException('BOM不存在');

    await this.bomRepository.update(
      { materialId: bom.materialId, isDeleted: 0 },
      { isDefault: 0 },
    );

    bom.isDefault = 1;
    return this.bomRepository.save(bom);
  }

  async createVersion(sourceId: string, newVersion: string): Promise<Bom> {
    const sourceBom = await this.findWithDetails(sourceId);
    if (!sourceBom) throw new NotFoundException('源BOM不存在');

    const existing = await this.bomRepository.findOne({
      where: { materialId: sourceBom.bom.materialId, version: newVersion, isDeleted: 0 },
    });
    if (existing) {
      throw new BadRequestException('该物料已存在相同版本的BOM');
    }

    const bomNo = await this.generateBomNo();
    const newBom = this.bomRepository.create({
      ...sourceBom.bom,
      id: undefined,
      bomNo,
      version: newVersion,
      isDefault: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    const savedBom = await this.bomRepository.save(newBom);

    const detailEntities = sourceBom.details.map(d => ({
      ...d,
      id: undefined,
      bomId: savedBom.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    await this.bomDetailRepository.save(detailEntities);

    return savedBom;
  }

  async compareVersions(bomId1: string, bomId2: string): Promise<any> {
    const bom1 = await this.findWithDetails(bomId1);
    const bom2 = await this.findWithDetails(bomId2);

    if (!bom1 || !bom2) {
      throw new NotFoundException('BOM不存在');
    }

    if (bom1.bom.materialId !== bom2.bom.materialId) {
      throw new BadRequestException('只能对比相同物料的BOM版本');
    }

    const details1 = bom1.details.reduce((map, d) => ({ ...map, [d.materialId]: d }), {});
    const details2 = bom2.details.reduce((map, d) => ({ ...map, [d.materialId]: d }), {});

    const allMaterialIds = new Set([...Object.keys(details1), ...Object.keys(details2)]);
    const changes = [];

    allMaterialIds.forEach(materialId => {
      const d1 = details1[materialId];
      const d2 = details2[materialId];

      if (!d1) {
        changes.push({ materialId, type: 'added', new: d2 });
      } else if (!d2) {
        changes.push({ materialId, type: 'removed', old: d1 });
      } else {
        const diff = [];
        if (d1.quantity !== d2.quantity) {
          diff.push({ field: 'quantity', old: d1.quantity, new: d2.quantity });
        }
        if (d1.scrapRate !== d2.scrapRate) {
          diff.push({ field: 'scrapRate', old: d1.scrapRate, new: d2.scrapRate });
        }
        if (d1.unitId !== d2.unitId) {
          diff.push({ field: 'unitId', old: d1.unitId, new: d2.unitId });
        }
        if (diff.length > 0) {
          changes.push({ materialId, type: 'modified', diff });
        }
      }
    });

    return {
      bom1: { ...bom1.bom, detailsCount: bom1.details.length },
      bom2: { ...bom2.bom, detailsCount: bom2.details.length },
      changes,
    };
  }

  async explodeBom(bomId: string, levels = 3): Promise<any> {
    const bom = await this.findWithDetails(bomId);
    if (!bom) throw new NotFoundException('BOM不存在');

    return this.recursiveExplode(bom, 1, levels);
  }

  private async recursiveExplode(bomData: { bom: Bom; details: BomDetail[] }, currentLevel: number, maxLevels: number): Promise<any> {
    const { bom, details } = bomData;

    const children = [];
    if (currentLevel < maxLevels) {
      const childMaterialIds = details.map(d => d.materialId);
      const childBoms = await this.bomRepository.find({
        where: { materialId: In(childMaterialIds), isDeleted: 0, isDefault: 1, status: 1 },
      });

      for (const detail of details) {
        const childBom = childBoms.find(b => b.materialId === detail.materialId);
        if (childBom) {
          const childDetails = await this.bomDetailRepository.find({
            where: { bomId: childBom.id, isDeleted: 0 },
            order: { createdAt: 'ASC' },
          });
          const exploded = await this.recursiveExplode(
            { bom: childBom, details: childDetails },
            currentLevel + 1,
            maxLevels,
          );
          children.push({
            detail,
            bom: childBom,
            children: exploded.children,
          });
        } else {
          children.push({ detail, bom: null, children: [] });
        }
      }
    }

    return {
      bom,
      details,
      level: currentLevel,
      children,
    };
  }

  async getMaterialRequirements(bomId: string, quantity: number): Promise<any> {
    const exploded = await this.explodeBom(bomId, 10);
    const requirements = {};

    this.calculateRequirements(exploded, quantity, requirements);

    return requirements;
  }

  private calculateRequirements(
    exploded: any,
    parentQuantity: number,
    requirements: Record<string, number>,
  ): void {
    for (const detail of exploded.details) {
      const qty = parentQuantity * Number(detail.quantity) * (1 + Number(detail.scrapRate) / 100);
      requirements[detail.materialId] = (requirements[detail.materialId] || 0) + qty;

      for (const child of exploded.children) {
        if (child.bom) {
          this.calculateRequirements(child, qty, requirements);
        }
      }
    }
  }

  async addDetails(bomId: string, details: Partial<BomDetail>[]): Promise<BomDetail[]> {
    const bom = await this.findById(bomId);
    if (!bom) throw new NotFoundException('BOM不存在');

    const existingMaterialIds = (await this.bomDetailRepository.find({
      where: { bomId, isDeleted: 0 },
    })).map(d => d.materialId);

    const newDetails = details.filter(d => !existingMaterialIds.includes(d.materialId));
    const detailEntities = newDetails.map(d => ({
      ...d,
      bomId,
    }));

    return this.bomDetailRepository.save(detailEntities);
  }

  async updateDetail(detailId: string, data: Partial<BomDetail>): Promise<BomDetail> {
    const detail = await this.bomDetailRepository.findOne({ where: { id: detailId, isDeleted: 0 } });
    if (!detail) throw new NotFoundException('BOM明细不存在');

    Object.assign(detail, data);
    return this.bomDetailRepository.save(detail);
  }

  async removeDetail(detailId: string): Promise<void> {
    const detail = await this.bomDetailRepository.findOne({ where: { id: detailId, isDeleted: 0 } });
    if (!detail) throw new NotFoundException('BOM明细不存在');

    detail.isDeleted = 1;
    await this.bomDetailRepository.save(detail);
  }
}