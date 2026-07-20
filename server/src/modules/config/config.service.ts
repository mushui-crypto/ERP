import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfig } from '../../database/entities/system-config.entity';
import { CreateSystemConfigDto, UpdateSystemConfigDto } from './dto/config.dto';

@Injectable()
export class ConfigService {
  private configCache: Map<string, any> = new Map();

  constructor(
    @InjectRepository(SystemConfig)
    private configRepository: Repository<SystemConfig>,
  ) {}

  async findAll(page = 1, pageSize = 20, configGroup?: string) {
    const where: any = { isDeleted: 0 };
    if (configGroup) where.configGroup = configGroup;
    
    const [list, total] = await this.configRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { configGroup: 'ASC', sortOrder: 'ASC', createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<SystemConfig | null> {
    return this.configRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByKey(configKey: string): Promise<SystemConfig | null> {
    return this.configRepository.findOne({ where: { configKey, isDeleted: 0 } });
  }

  async findByGroup(configGroup: string): Promise<SystemConfig[]> {
    return this.configRepository.find({
      where: { configGroup, isDeleted: 0, status: 1 },
      order: { sortOrder: 'ASC' },
    });
  }

  async getValue(configKey: string): Promise<any> {
    const cached = this.configCache.get(configKey);
    if (cached !== undefined) return cached;

    const config = await this.findByKey(configKey);
    if (!config) return null;

    let result: any = config.configValue;
    try {
      switch (config.valueType) {
        case 'number':
          result = parseFloat(config.configValue);
          break;
        case 'boolean':
          result = config.configValue === 'true' || config.configValue === '1';
          break;
        case 'json':
          result = JSON.parse(config.configValue);
          break;
      }
    } catch {
    }

    this.configCache.set(configKey, result);
    return result;
  }

  async getGroupValues(configGroup: string): Promise<Record<string, any>> {
    const configs = await this.findByGroup(configGroup);
    const result: Record<string, any> = {};
    
    for (const config of configs) {
      result[config.configKey] = await this.getValue(config.configKey);
    }
    
    return result;
  }

  async create(data: CreateSystemConfigDto): Promise<SystemConfig> {
    const existing = await this.findByKey(data.configKey);
    if (existing) throw new ConflictException('配置键已存在');
    
    const entity = this.configRepository.create(data) as SystemConfig;
    const saved = await this.configRepository.save(entity);
    
    this.configCache.delete(data.configKey);
    return saved;
  }

  async update(id: string, data: UpdateSystemConfigDto): Promise<SystemConfig> {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException('配置不存在');
    if (entity.isSystem === 1 && !data.isEditable) throw new ConflictException('系统内置配置不能修改');
    
    Object.assign(entity, data);
    const saved = await this.configRepository.save(entity);
    
    this.configCache.delete(entity.configKey);
    return saved;
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException('配置不存在');
    if (entity.isSystem === 1) throw new ConflictException('系统内置配置不能删除');
    
    entity.isDeleted = 1;
    await this.configRepository.save(entity);
    
    this.configCache.delete(entity.configKey);
  }

  async clearCache(): Promise<void> {
    this.configCache.clear();
  }
}