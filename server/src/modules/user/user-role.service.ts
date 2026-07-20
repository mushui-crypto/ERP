import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SysUserRole } from '../../database/entities/sys-user-role.entity';

@Injectable()
export class UserRoleService {
  constructor(
    @InjectRepository(SysUserRole)
    private userRoleRepository: Repository<SysUserRole>,
  ) {}

  async assignRoles(userId: string, roleIds: string[]): Promise<void> {
    await this.userRoleRepository.delete({ userId });

    if (roleIds && roleIds.length > 0) {
      const userRoles = roleIds.map(roleId => ({
        userId,
        roleId,
      }));
      await this.userRoleRepository.save(userRoles);
    }
  }

  async getRolesByUserId(userId: string): Promise<string[]> {
    const userRoles = await this.userRoleRepository.find({ where: { userId } });
    return userRoles.map(ur => ur.roleId);
  }

  async removeRoles(userId: string): Promise<void> {
    await this.userRoleRepository.delete({ userId });
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    await this.userRoleRepository.delete({ userId, roleId });
  }

  async getUsersByRoleId(roleId: string): Promise<string[]> {
    const userRoles = await this.userRoleRepository.find({ where: { roleId } });
    return userRoles.map(ur => ur.userId);
  }
}