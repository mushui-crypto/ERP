import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UserRoleService } from './user-role.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';

@ApiTags('用户管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userRoleService: UserRoleService,
  ) {}

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('orgId') orgId?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.userService.findAll(pageNum, pageSizeNum, orgId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findById(id);
    if (user) {
      const roleIds = await this.userRoleService.getRolesByUserId(id);
      return { ...user, roleIds };
    }
    return user;
  }

  @Post()
  @ApiOperation({ summary: '创建用户' })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.userService.create(dto);
    return user;
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  @Put(':id/roles')
  @ApiOperation({ summary: '分配角色' })
  async assignRoles(@Param('id') id: string, @Body('roleIds') roleIds: string[]) {
    await this.userRoleService.assignRoles(id, roleIds);
    return { message: '角色分配成功' };
  }

  @Get(':id/roles')
  @ApiOperation({ summary: '获取用户角色' })
  async getUserRoles(@Param('id') id: string) {
    const roleIds = await this.userRoleService.getRolesByUserId(id);
    return { roleIds };
  }

  @Put(':id/reset-password')
  @ApiOperation({ summary: '重置密码' })
  async resetPassword(@Param('id') id: string, @Body() body: { password: string }) {
    return this.userService.resetPassword(id, body.password);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  async remove(@Param('id') id: string) {
    await this.userService.remove(id);
    await this.userRoleService.removeRoles(id);
    return null;
  }
}