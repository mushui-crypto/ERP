import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserDataCenter } from '../../database/entities/user-data-center.entity';
import { UserOrgRole } from '../../database/entities/user-org-role.entity';
import { DataCenter } from '../../database/entities/data-center.entity';
import { Org } from '../../database/entities/org.entity';
import { Role } from '../../database/entities/role.entity';

@Injectable()
export class DataCenterAuthService {
  constructor(
    @InjectRepository(UserDataCenter)
    private userDataCenterRepository: Repository<UserDataCenter>,
    @InjectRepository(UserOrgRole)
    private userOrgRoleRepository: Repository<UserOrgRole>,
    @InjectRepository(DataCenter)
    private dataCenterRepository: Repository<DataCenter>,
    @InjectRepository(Org)
    private orgRepository: Repository<Org>,
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
  ) {}

  async getUserDataCenters(userId: string): Promise<DataCenter[]> {
    const relations = await this.userDataCenterRepository.find({
      where: { userId, status: 1 },
    });
    const dcIds = relations.map(r => r.dataCenterId);
    if (dcIds.length === 0) {
      return [];
    }
    return this.dataCenterRepository.find({
      where: { id: In(dcIds), status: 1 },
    });
  }

  async addUserDataCenter(userId: string, dataCenterId: string): Promise<void> {
    const exists = await this.userDataCenterRepository.findOne({
      where: { userId, dataCenterId },
    });
    if (!exists) {
      await this.userDataCenterRepository.save({ userId, dataCenterId, status: 1 });
    }
  }

  async removeUserDataCenter(userId: string, dataCenterId: string): Promise<void> {
    await this.userDataCenterRepository.delete({ userId, dataCenterId });
  }

  async getUserOrgs(userId: string, dataCenterId: string): Promise<Org[]> {
    const userOrgRoles = await this.userOrgRoleRepository.find({
      where: { userId, status: 1 },
    });
    const orgIds = [...new Set(userOrgRoles.map(r => r.orgId))];
    if (orgIds.length === 0) {
      return [];
    }
    return this.orgRepository.find({
      where: { id: In(orgIds), dataCenterId, status: 1 },
    });
  }

  async assignUserOrgRole(userId: string, orgId: string, roleId: string): Promise<void> {
    const org = await this.orgRepository.findOne({ where: { id: orgId, status: 1 } });
    if (!org) {
      throw new NotFoundException('组织不存在');
    }
    const role = await this.roleRepository.findOne({ where: { id: roleId, status: 1 } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }
    const exists = await this.userOrgRoleRepository.findOne({
      where: { userId, orgId, roleId },
    });
    if (!exists) {
      await this.userOrgRoleRepository.save({ userId, orgId, roleId, status: 1 });
    }
  }

  async removeUserOrgRole(userId: string, orgId: string, roleId: string): Promise<void> {
    await this.userOrgRoleRepository.delete({ userId, orgId, roleId });
  }

  async getUserRoles(userId: string, orgId: string): Promise<Role[]> {
    const userOrgRoles = await this.userOrgRoleRepository.find({
      where: { userId, orgId, status: 1 },
    });
    const roleIds = userOrgRoles.map(r => r.roleId);
    if (roleIds.length === 0) {
      return [];
    }
    return this.roleRepository.find({
      where: { id: In(roleIds), status: 1 },
    });
  }

  async getUserPermissions(userId: string, orgId: string): Promise<string[]> {
    const roles = await this.getUserRoles(userId, orgId);
    const permissions: string[] = [];
    roles.forEach(role => {
      if (role.permissions) {
        try {
          const perms = JSON.parse(role.permissions);
          permissions.push(...perms);
        } catch {
        }
      }
    });
    return [...new Set(permissions)];
  }
}