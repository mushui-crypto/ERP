import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Department } from '../../database/entities/department.entity';
import { CreateDepartmentDto, UpdateDepartmentDto } from './dto/department.dto';

@Injectable()
export class DepartmentService {
  constructor(
    @InjectRepository(Department)
    private departmentRepository: Repository<Department>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.departmentRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Department | null> {
    return this.departmentRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByCode(deptCode: string): Promise<Department | null> {
    return this.departmentRepository.findOne({ where: { deptCode, isDeleted: 0 } });
  }

  async findTree(): Promise<any[]> {
    const all = await this.departmentRepository.find({
      where: { isDeleted: 0, status: 1 },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });

    const map = new Map<string, any>();
    const result: any[] = [];

    all.forEach(item => {
      map.set(item.id, { ...item, children: [] });
    });

    all.forEach(item => {
      if (item.parentId && map.has(item.parentId)) {
        map.get(item.parentId).children.push(map.get(item.id));
      } else {
        result.push(map.get(item.id));
      }
    });

    return result;
  }

  async findChildren(parentId: string): Promise<Department[]> {
    return this.departmentRepository.find({
      where: { parentId, isDeleted: 0, status: 1 },
      order: { sortOrder: 'ASC' },
    });
  }

  async create(data: CreateDepartmentDto): Promise<Department> {
    const existing = await this.findByCode(data.deptCode);
    if (existing) throw new ConflictException('部门编码已存在');
    
    const entity = this.departmentRepository.create(data);
    return this.departmentRepository.save(entity);
  }

  async update(id: string, data: UpdateDepartmentDto): Promise<Department> {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException('部门不存在');
    
    Object.assign(entity, data);
    return this.departmentRepository.save(entity);
  }

  async remove(id: string): Promise<void> {
    const entity = await this.findById(id);
    if (!entity) throw new NotFoundException('部门不存在');

    const hasChildren = await this.departmentRepository.exists({ where: { parentId: id, isDeleted: 0 } });
    if (hasChildren) throw new ConflictException('该部门下存在子部门，无法删除');
    
    entity.isDeleted = 1;
    await this.departmentRepository.save(entity);
  }
}