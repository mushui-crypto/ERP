import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MetaEntity } from '../../database/entities/meta-entity.entity';
import { MetaField } from '../../database/entities/meta-field.entity';
import { CreateMetaEntityDto, UpdateMetaEntityDto } from './dto/meta-entity.dto';

@Injectable()
export class MetaEntityService {
  constructor(
    @InjectRepository(MetaEntity)
    private metaEntityRepository: Repository<MetaEntity>,
    @InjectRepository(MetaField)
    private metaFieldRepository: Repository<MetaField>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.metaEntityRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<MetaEntity | null> {
    return this.metaEntityRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByCode(entityCode: string): Promise<MetaEntity | null> {
    return this.metaEntityRepository.findOne({ where: { entityCode, isDeleted: 0 } });
  }

  async findWithFields(entityCode: string): Promise<any> {
    const entity = await this.findByCode(entityCode);
    if (!entity) return null;

    const fields = await this.metaFieldRepository.find({
      where: { entityId: entity.id, isDeleted: 0, status: 1 },
      order: { sortOrder: 'ASC' },
    });

    return {
      entity,
      fields,
    };
  }

  async create(data: CreateMetaEntityDto): Promise<MetaEntity> {
    const existing = await this.findByCode(data.entityCode);
    if (existing) throw new ConflictException('实体编码已存在');

    const entity = this.metaEntityRepository.create(data);
    return this.metaEntityRepository.save(entity);
  }

  async update(id: string, data: UpdateMetaEntityDto): Promise<MetaEntity> {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException('元数据实体不存在');
    if (entity.isSystem === 1) throw new ConflictException('系统内置实体不能修改');

    Object.assign(entity, data);
    return this.metaEntityRepository.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException('元数据实体不存在');
    if (entity.isSystem === 1) throw new ConflictException('系统内置实体不能删除');

    const hasFields = await this.metaFieldRepository.exists({ where: { entityId: id, isDeleted: 0 } });
    if (hasFields) throw new ConflictException('该实体下存在字段，无法删除');

    entity.isDeleted = 1;
    await this.metaEntityRepository.save(entity);
  }

  async getFormSchema(entityCode: string): Promise<any> {
    const result = await this.findWithFields(entityCode);
    if (!result) throw new NotFoundException('实体不存在');

    const { entity, fields } = result;

    return {
      entityCode: entity.entityCode,
      entityName: entity.entityName,
      tableName: entity.tableName,
      fields: fields.map(field => ({
        fieldCode: field.fieldCode,
        fieldName: field.fieldName,
        fieldType: field.fieldType,
        fieldLength: field.fieldLength,
        isRequired: field.isRequired === true,
        isUnique: field.isUnique === true,
        isSearchable: field.isSearchable === true,
        isListVisible: field.isListVisible === true,
        defaultValue: field.defaultValue,
        dictCode: field.dictCode,
        sortOrder: field.sortOrder,
      })),
    };
  }
}