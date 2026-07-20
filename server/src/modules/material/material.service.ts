import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from '../../database/entities/material.entity';
import { CreateMaterialDto, UpdateMaterialDto } from './dto/material.dto';

@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private materialRepository: Repository<Material>,
  ) {}

  async findAll(page = 1, pageSize = 20, materialCode?: string, materialName?: string) {
    const queryBuilder = this.materialRepository
      .createQueryBuilder('material')
      .where('material.isDeleted = 0');

    if (materialCode) {
      queryBuilder.andWhere('material.material_code LIKE :materialCode', { materialCode: `%${materialCode}%` });
    }
    if (materialName) {
      queryBuilder.andWhere('material.material_name LIKE :materialName', { materialName: `%${materialName}%` });
    }

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('material.created_at', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Material | null> {
    return this.materialRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByCode(materialCode: string): Promise<Material | null> {
    return this.materialRepository.findOne({ where: { materialCode, isDeleted: 0 } });
  }

  async create(dto: CreateMaterialDto): Promise<Material> {
    const existing = await this.findByCode(dto.materialCode);
    if (existing) {
      throw new ConflictException('物料编码已存在');
    }

    if (!dto.status) dto.status = 1;
    if (!dto.materialType) dto.materialType = 1;
    if (dto.isBatchManage === undefined) dto.isBatchManage = 0;
    if (dto.isSerialManage === undefined) dto.isSerialManage = 0;

    const material = this.materialRepository.create(dto) as Material;
    return this.materialRepository.save(material);
  }

  async update(id: string, dto: UpdateMaterialDto): Promise<Material> {
    const material = await this.findById(id);
    if (!material) throw new NotFoundException('物料不存在');

    if (dto.materialCode && dto.materialCode !== material.materialCode) {
      const existing = await this.findByCode(dto.materialCode);
      if (existing) {
        throw new ConflictException('物料编码已存在');
      }
    }

    const updateData: any = {};
    if (dto.materialCode !== undefined) updateData.materialCode = dto.materialCode;
    if (dto.materialName !== undefined) updateData.materialName = dto.materialName;
    if (dto.materialSpec !== undefined) updateData.materialSpec = dto.materialSpec;
    if (dto.categoryId !== undefined) updateData.categoryId = dto.categoryId;
    if (dto.unitId !== undefined) updateData.unitId = dto.unitId;
    if (dto.materialType !== undefined) updateData.materialType = dto.materialType;
    if (dto.purchaseType !== undefined) updateData.purchaseType = dto.purchaseType;
    if (dto.barcode !== undefined) updateData.barcode = dto.barcode;
    if (dto.defaultWarehouse !== undefined) updateData.defaultWarehouse = dto.defaultWarehouse;
    if (dto.safetyStock !== undefined) updateData.safetyStock = dto.safetyStock;
    if (dto.minOrderQty !== undefined) updateData.minOrderQty = dto.minOrderQty;
    if (dto.leadTime !== undefined) updateData.leadTime = dto.leadTime;
    if (dto.standardCost !== undefined) updateData.standardCost = dto.standardCost;
    if (dto.salePrice !== undefined) updateData.salePrice = dto.salePrice;
    if (dto.isBatchManage !== undefined) updateData.isBatchManage = dto.isBatchManage;
    if (dto.isSerialManage !== undefined) updateData.isSerialManage = dto.isSerialManage;
    if (dto.shelfLifeDays !== undefined) updateData.shelfLifeDays = dto.shelfLifeDays;
    if (dto.remark !== undefined) updateData.remark = dto.remark;
    if (dto.status !== undefined) updateData.status = dto.status;

    await this.materialRepository.update(id, updateData);
    return this.findById(id) as Promise<Material>;
  }

  async remove(id: string): Promise<void> {
    const material = await this.findById(id);
    if (!material) throw new NotFoundException('物料不存在');
    await this.materialRepository.update(id, { isDeleted: 1 });
  }
}