import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DataCenterAuthService } from './data-center-auth.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('数据中心权限')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('data-center-auth')
export class DataCenterAuthController {
  constructor(private readonly authService: DataCenterAuthService) {}

  @Get('user-data-centers')
  @ApiOperation({ summary: '获取用户的数据中心列表' })
  async getUserDataCenters(@Query('userId') userId: string) {
    const dataCenters = await this.authService.getUserDataCenters(userId);
    return { code: 200, message: 'success', data: dataCenters };
  }

  @Post('user-data-center')
  @ApiOperation({ summary: '分配用户数据中心' })
  async addUserDataCenter(@Body() body: { userId: string; dataCenterId: string }) {
    await this.authService.addUserDataCenter(body.userId, body.dataCenterId);
    return { code: 200, message: 'success' };
  }

  @Delete('user-data-center')
  @ApiOperation({ summary: '移除用户数据中心' })
  async removeUserDataCenter(@Body() body: { userId: string; dataCenterId: string }) {
    await this.authService.removeUserDataCenter(body.userId, body.dataCenterId);
    return { code: 200, message: 'success' };
  }

  @Get('user-orgs')
  @ApiOperation({ summary: '获取用户在数据中心的组织列表' })
  async getUserOrgs(@Query('userId') userId: string, @Query('dataCenterId') dataCenterId: string) {
    const orgs = await this.authService.getUserOrgs(userId, dataCenterId);
    return { code: 200, message: 'success', data: orgs };
  }

  @Post('user-org-role')
  @ApiOperation({ summary: '分配用户组织角色' })
  async assignUserOrgRole(@Body() body: { userId: string; orgId: string; roleId: string }) {
    await this.authService.assignUserOrgRole(body.userId, body.orgId, body.roleId);
    return { code: 200, message: 'success' };
  }

  @Delete('user-org-role')
  @ApiOperation({ summary: '移除用户组织角色' })
  async removeUserOrgRole(@Body() body: { userId: string; orgId: string; roleId: string }) {
    await this.authService.removeUserOrgRole(body.userId, body.orgId, body.roleId);
    return { code: 200, message: 'success' };
  }

  @Get('user-roles')
  @ApiOperation({ summary: '获取用户在组织的角色' })
  async getUserRoles(@Query('userId') userId: string, @Query('orgId') orgId: string) {
    const roles = await this.authService.getUserRoles(userId, orgId);
    return { code: 200, message: 'success', data: roles };
  }

  @Get('user-permissions')
  @ApiOperation({ summary: '获取用户在组织的权限' })
  async getUserPermissions(@Query('userId') userId: string, @Query('orgId') orgId: string) {
    const permissions = await this.authService.getUserPermissions(userId, orgId);
    return { code: 200, message: 'success', data: permissions };
  }
}