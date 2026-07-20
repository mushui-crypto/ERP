import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetaField } from '../../database/entities/meta-field.entity';
import { MetaEntity } from '../../database/entities/meta-entity.entity';
import { CreateMetaFieldDto, UpdateMetaFieldDto } from './dto/meta-field.dto';

const VALID_FIELD_TYPES = ['string', 'number', 'date', 'boolean', 'decimal', 'text', 'select', 'multiselect', 'datetime', 'email', 'phone'];

@Injectable()
export class MetaFieldService {
  constructor(
    @InjectRepository(MetaField)
    private metaFieldRepository: Repository<MetaField>,
    @InjectRepository(MetaEntity)
    private metaEntityRepository: Repository<MetaEntity>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.metaFieldRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<MetaField | null> {
    return this.metaFieldRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByEntityId(entityId: string): Promise<MetaField[]> {
    return this.metaFieldRepository.find({
      where: { entityId, isDeleted: 0 },
      order: { sortOrder: 'ASC' },
    });
  }

  async findByEntityCode(entityCode: string): Promise<MetaField[]> {
    const entity = await this.metaEntityRepository.findOne({ where: { entityCode, isDeleted: 0 } });
    if (!entity) return [];
    return this.findByEntityId(entity.id);
  }

  async create(data: CreateMetaFieldDto): Promise<MetaField> {
    const entity = await this.metaEntityRepository.findOne({ where: { id: data.entityId, isDeleted: 0 } });
    if (!entity) throw new NotFoundException('所属实体不存在');

    if (!VALID_FIELD_TYPES.includes(data.fieldType)) {
      throw new ConflictException(`字段类型必须是: ${VALID_FIELD_TYPES.join(', ')}`);
    }

    const existing = await this.metaFieldRepository.findOne({
      where: { entityId: data.entityId, fieldCode: data.fieldCode, isDeleted: 0 },
    });
    if (existing) throw new ConflictException('字段编码已存在');

    const field = this.metaFieldRepository.create(data) as MetaField;
    return this.metaFieldRepository.save(field);
  }

  async update(id: string, data: UpdateMetaFieldDto): Promise<MetaField> {
    const field = await this.findById(id);
    if (!field) throw new NotFoundException('元数据字段不存在');

    if (data.fieldType && !VALID_FIELD_TYPES.includes(data.fieldType)) {
      throw new ConflictException(`字段类型必须是: ${VALID_FIELD_TYPES.join(', ')}`);
    }

    Object.assign(field, data);
    return this.metaFieldRepository.save(field);
  }

  async remove(id: string): Promise<void> {
    const field = await this.findById(id);
    if (!field) throw new NotFoundException('元数据字段不存在');

    field.isDeleted = 1;
    await this.metaFieldRepository.save(field);
  }

  async getSearchableFields(entityCode: string): Promise<any[]> {
    const fields = await this.findByEntityCode(entityCode);
    return fields
      .filter(f => f.isSearchable === 1 && f.status === 1)
      .map(f => ({
        fieldCode: f.fieldCode,
        fieldName: f.fieldName,
        fieldType: f.fieldType,
      }));
  }

  async getListFields(entityCode: string): Promise<any[]> {
    const fields = await this.findByEntityCode(entityCode);
    return fields
      .filter(f => f.isListVisible === 1 && f.status === 1)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map(f => ({
        fieldCode: f.fieldCode,
        fieldName: f.fieldName,
        fieldType: f.fieldType,
      }));
  }
}