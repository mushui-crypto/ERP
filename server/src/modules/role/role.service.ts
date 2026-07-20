import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../database/entities/role.entity';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.roleRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByCode(code: string): Promise<Role | null> {
    return this.roleRepository.findOne({ where: { code, isDeleted: 0 } });
  }

  async create(dto: CreateRoleDto): Promise<Role> {
    const existing = await this.findByCode(dto.code);
    if (existing) {
      throw new ConflictException('角色编码已存在');
    }

    if (!dto.status) dto.status = 1;
    if (!dto.dataScope) dto.dataScope = 1;
    if (!dto.permissions) dto.permissions = JSON.stringify([]);

    const role = this.roleRepository.create(dto);
    return this.roleRepository.save(role);
  }

  async update(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.findById(id);
    if (!role) throw new NotFoundException('角色不存在');

    if (dto.code && dto.code !== role.code) {
      const existing = await this.findByCode(dto.code);
      if (existing) {
        throw new ConflictException('角色编码已存在');
      }
    }

    Object.assign(role, dto);
    return this.roleRepository.save(role);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findById(id);
    if (!role) throw new NotFoundException('角色不存在');

    if (role.code === 'ADMIN') {
      throw new ConflictException('系统管理员角色不能删除');
    }

    role.isDeleted = 1;
    await this.roleRepository.save(role);
  }
}