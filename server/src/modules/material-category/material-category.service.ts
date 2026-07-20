import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MaterialCategory } from '../../database/entities/material-category.entity';

@Injectable()
export class MaterialCategoryService {
  constructor(
    @InjectRepository(MaterialCategory)
    private materialCategoryRepository: Repository<MaterialCategory>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.materialCategoryRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<MaterialCategory | null> {
    return this.materialCategoryRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByParentId(parentId: string): Promise<MaterialCategory[]> {
    return this.materialCategoryRepository.find({ where: { parentId, isDeleted: 0 } });
  }

  async findTree(): Promise<any[]> {
    const all = await this.materialCategoryRepository.find({
      where: { isDeleted: 0 },
      order: { sortOrder: 'ASC' },
    });
    const buildTree = (parentId: string | null): any[] => {
      return all
        .filter((item) => (parentId === null ? !item.parentId : item.parentId === parentId))
        .map((item) => ({
          ...item,
          children: buildTree(item.id),
        }));
    };
    return buildTree(null);
  }

  async create(data: Partial<MaterialCategory>): Promise<MaterialCategory> {
    const category = this.materialCategoryRepository.create(data);
    return this.materialCategoryRepository.save(category);
  }

  async update(id: string, data: Partial<MaterialCategory>): Promise<MaterialCategory> {
    const category = await this.findById(id);
    if (!category) throw new NotFoundException('物料分类不存在');
    Object.assign(category, data);
    return this.materialCategoryRepository.save(category);
  }

  async remove(id: string): Promise<void> {
    const category = await this.findById(id);
    if (!category) throw new NotFoundException('物料分类不存在');
    category.isDeleted = 1;
    await this.materialCategoryRepository.save(category);
  }
}
