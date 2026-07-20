import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from '../../database/entities/menu.entity';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.menuRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Menu | null> {
    return this.menuRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findTree() {
    const menus = await this.menuRepository.find({
      where: { isDeleted: 0 },
      order: { sortOrder: 'ASC', createdAt: 'DESC' },
    });
    return this.buildTree(menus);
  }

  private buildTree(nodes: Menu[], parentId?: string): Menu[] {
    return nodes
      .filter(n => (n.parentId || null) === (parentId || null))
      .map(n => ({
        ...n,
        children: this.buildTree(nodes, n.id),
      }));
  }

  async create(dto: CreateMenuDto): Promise<Menu> {
    if (dto.parentId) {
      const parent = await this.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException('父级菜单不存在');
      }
    }

    if (!dto.menuType) dto.menuType = 1;
    if (!dto.status) dto.status = 1;
    if (!dto.isVisible) dto.isVisible = 1;
    if (!dto.isCache) dto.isCache = 0;
    if (!dto.sortOrder) dto.sortOrder = 0;

    const menu = this.menuRepository.create(dto);
    return this.menuRepository.save(menu);
  }

  async update(id: string, dto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findById(id);
    if (!menu) throw new NotFoundException('菜单不存在');

    if (dto.parentId && dto.parentId !== menu.parentId) {
      const parent = await this.findById(dto.parentId);
      if (!parent) {
        throw new NotFoundException('父级菜单不存在');
      }
    }

    Object.assign(menu, dto);
    return this.menuRepository.save(menu);
  }

  async remove(id: string): Promise<void> {
    const menu = await this.findById(id);
    if (!menu) throw new NotFoundException('菜单不存在');

    const hasChildren = await this.menuRepository.findOne({
      where: { parentId: id, isDeleted: 0 },
    });
    if (hasChildren) {
      throw new ConflictException('存在子菜单，不能删除');
    }

    menu.isDeleted = 1;
    await this.menuRepository.save(menu);
  }
}