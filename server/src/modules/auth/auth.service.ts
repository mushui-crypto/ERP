import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { UserRoleService } from '../user/user-role.service';
import { DataCenterAuthService } from '../data-center/data-center-auth.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private userRoleService: UserRoleService,
    private dataCenterAuthService: DataCenterAuthService,
  ) {}

  async validateUser(username: string, password: string) {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('用户名或密码错误');
    }

    if (user.status !== 1) {
      throw new UnauthorizedException('账号已被禁用，请联系管理员');
    }

    return user;
  }

  async login(user: any) {
    const payload = {
      userId: user.id,
      username: user.username,
    };

    const roleIds = await this.userRoleService.getRolesByUserId(user.id);
    const dataCenters = await this.dataCenterAuthService.getUserDataCenters(user.id);

    return {
      accessToken: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        realName: user.realName,
        avatar: user.avatar,
        roleIds: roleIds,
      },
      dataCenters: dataCenters,
    };
  }

  async getProfile(userId: string) {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    const roleIds = await this.userRoleService.getRolesByUserId(userId);
    const dataCenters = await this.dataCenterAuthService.getUserDataCenters(userId);
    return {
      ...user,
      roleIds,
      dataCenters,
    };
  }
}