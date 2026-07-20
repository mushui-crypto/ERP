import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Org } from '../../database/entities/org.entity';
import { CreateOrgDto, UpdateOrgDto } from './dto/org.dto';

@Injectable()
export class OrgService {
  constructor(
    @InjectRepository(Org)
    private orgRepository: Repository<Org>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.orgRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Org | null> {
    return this.orgRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByCode(code: string): Promise<Org | null> {
    return this.orgRepository.findOne({ where: { code, isDeleted: 0 } });
  }

  async findTree() {
    const orgs = await this.orgRepository.find({
      where: { isDeleted: 0 },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
    return this.buildTree(orgs);
  }

  private buildTree(nodes: Org[], parentId?: string): Org[] {
    return nodes
      .filter(n => n.parentId === parentId)
      .map(n => ({
        ...n,
        children: this.buildTree(nodes, n.id),
      }));
  }

  async create(dto: CreateOrgDto): Promise<Org> {
    const existing = await this.findByCode(dto.code);
    if (existing) {
      throw new ConflictException('组织编码已存在');
    }

    if (dto.parentId) {
      const parent = await this.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException('父级组织不存在');
      }
    }

    if (!dto.status) dto.status = 1;
    if (!dto.orgType) dto.orgType = 1;
    if (!dto.sortOrder) dto.sortOrder = 0;

    const org = this.orgRepository.create(dto);
    return this.orgRepository.save(org);
  }

  async update(id: string, dto: UpdateOrgDto): Promise<Org> {
    const org = await this.findById(id);
    if (!org) throw new NotFoundException('组织不存在');

    if (dto.code && dto.code !== org.code) {
      const existing = await this.findByCode(dto.code);
      if (existing) {
        throw new ConflictException('组织编码已存在');
      }
    }

    if (dto.parentId) {
      const parent = await this.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException('父级组织不存在');
      }
    }

    Object.assign(org, dto);
    return this.orgRepository.save(org);
  }

  async remove(id: string): Promise<void> {
    const org = await this.findById(id);
    if (!org) throw new NotFoundException('组织不存在');

    const hasChildren = await this.orgRepository.findOne({
      where: { parentId: id, isDeleted: 0 },
    });
    if (hasChildren) {
      throw new ConflictException('存在子组织，不能删除');
    }

    org.isDeleted = 1;
    await this.orgRepository.save(org);
  }
}