import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';

@ApiTags('角色管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: '获取角色列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.roleService.findAll(pageNum, pageSizeNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取角色详情' })
  async findOne(@Param('id') id: string) {
    return this.roleService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建角色' })
  async create(@Body() dto: CreateRoleDto) {
    return this.roleService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新角色' })
  async update(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.roleService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  async remove(@Param('id') id: string) {
    await this.roleService.remove(id);
    return null;
  }
}