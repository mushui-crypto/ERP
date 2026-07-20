import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from '../../database/entities/user.entity';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.username = :username', { username })
      .andWhere('user.isDeleted = 0')
      .getOne();
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { id, isDeleted: 0 },
    });
  }

  async findAll(page = 1, pageSize = 20, orgId?: string) {
    const where: any = { isDeleted: 0 };
    if (orgId) {
      where.orgId = orgId;
    }

    const [list, total] = await this.userRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async create(dto: CreateUserDto): Promise<User> {
    const existing = await this.findByUsername(dto.username);
    if (existing) {
      throw new ConflictException('用户名已存在');
    }

    if (!dto.status) dto.status = 1;

    const user = this.userRepository.create(dto);
    if (dto.password) {
      user.password = await bcrypt.hash(dto.password, 10);
    }
    return this.userRepository.save(user);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (dto.username && dto.username !== user.username) {
      const existing = await this.findByUsername(dto.username);
      if (existing) {
        throw new ConflictException('用户名已存在');
      }
    }

    if (dto.password) {
      dto.password = await bcrypt.hash(dto.password, 10);
    }

    Object.assign(user, dto);
    return this.userRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    if (user.username === 'admin') {
      throw new ConflictException('系统管理员不能删除');
    }

    user.isDeleted = 1;
    await this.userRepository.save(user);
  }

  async resetPassword(id: string, newPassword: string): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    return this.userRepository.save(user);
  }
}