﻿import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DictType } from '../../database/entities/dict-type.entity';
import { DictData } from '../../database/entities/dict-data.entity';
import { CreateDictTypeDto, UpdateDictTypeDto } from './dto/dict-type.dto';
import { CreateDictDataDto, UpdateDictDataDto } from './dto/dict-data.dto';

@Injectable()
export class DictService {
  constructor(
    @InjectRepository(DictType)
    private dictTypeRepository: Repository<DictType>,
    @InjectRepository(DictData)
    private dictDataRepository: Repository<DictData>,
  ) {}

  async findAllTypes(page = 1, pageSize = 20) {
    const [list, total] = await this.dictTypeRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findTypeById(id: string): Promise<DictType | null> {
    return this.dictTypeRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findTypeByCode(dictCode: string): Promise<DictType | null> {
    return this.dictTypeRepository.findOne({ where: { dictCode, isDeleted: 0 } });
  }

  async createType(data: CreateDictTypeDto): Promise<DictType> {
    const existing = await this.findTypeByCode(data.dictCode);
    if (existing) throw new ConflictException('字典编码已存在');
    
    const entity = this.dictTypeRepository.create(data);
    return this.dictTypeRepository.save(entity);
  }

  async updateType(id: string, data: UpdateDictTypeDto): Promise<DictType> {
    const entity = await this.findTypeById(id);
    if (!entity) throw new NotFoundException('字典类型不存在');
    if (entity.isSystem === 1) throw new ConflictException('系统内置字典不能修改');
    
    Object.assign(entity, data);
    return this.dictTypeRepository.save(entity);
  }

  async removeType(id: string): Promise<void> {
    const entity = await this.findTypeById(id);
    if (!entity) throw new NotFoundException('字典类型不存在');
    if (entity.isSystem === 1) throw new ConflictException('系统内置字典不能删除');
    
    const hasData = await this.dictDataRepository.exists({ where: { dictCode: entity.dictCode, isDeleted: 0 } });
    if (hasData) throw new ConflictException('该字典类型下存在数据，无法删除');
    
    entity.isDeleted = 1;
    await this.dictTypeRepository.save(entity);
  }

  async findAllData(page = 1, pageSize = 20, dictCode?: string) {
    const where: any = { isDeleted: 0 };
    if (dictCode) where.dictCode = dictCode;
    
    const [list, total] = await this.dictDataRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findDataById(id: string): Promise<DictData | null> {
    return this.dictDataRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findDataByCode(dictCode: string): Promise<DictData[]> {
    return this.dictDataRepository.find({
      where: { dictCode, isDeleted: 0, status: 1 },
      order: { sortOrder: 'ASC' },
    });
  }

  async findDataByCodeWithTree(dictCode: string): Promise<any[]> {
    const data = await this.dictDataRepository.find({
      where: { dictCode, isDeleted: 0, status: 1 },
      order: { sortOrder: 'ASC' },
    });
    
    const map = new Map<string, any>();
    const result: any[] = [];
    
    data.forEach(item => {
      map.set(item.dictValue, { ...item, children: [] });
    });
    
    data.forEach(item => {
      if (item.parentValue && map.has(item.parentValue)) {
        map.get(item.parentValue).children.push(map.get(item.dictValue));
      } else {
        result.push(map.get(item.dictValue));
      }
    });
    
    return result;
  }

  async createData(data: CreateDictDataDto): Promise<DictData> {
    const type = await this.findTypeByCode(data.dictCode);
    if (!type) throw new NotFoundException('字典类型不存在');
    
    const existing = await this.dictDataRepository.findOne({
      where: { dictCode: data.dictCode, dictValue: data.dictValue, isDeleted: 0 },
    });
    if (existing) throw new ConflictException('字典值已存在');
    
    const entity = this.dictDataRepository.create(data);
    if (!entity.level && entity.parentValue) {
      const parent = await this.dictDataRepository.findOne({
        where: { dictCode: data.dictCode, dictValue: data.parentValue, isDeleted: 0 },
      });
      entity.level = parent ? parent.level + 1 : 1;
    } else if (!entity.level) {
      entity.level = 1;
    }
    
    return this.dictDataRepository.save(entity);
  }

  async updateData(id: string, data: UpdateDictDataDto): Promise<DictData> {
    const entity = await this.findDataById(id);
    if (!entity) throw new NotFoundException('字典数据不存在');
    
    Object.assign(entity, data);
    return this.dictDataRepository.save(entity);
  }

  async removeData(id: string): Promise<void> {
    const entity = await this.findDataById(id);
    if (!entity) throw new NotFoundException('字典数据不存在');
    
    entity.isDeleted = 1;
    await this.dictDataRepository.save(entity);
  }
}