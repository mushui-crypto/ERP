import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MenuService } from './menu.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateMenuDto, UpdateMenuDto } from './dto/menu.dto';

@ApiTags('菜单管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('menus')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @ApiOperation({ summary: '获取菜单列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.menuService.findAll(pageNum, pageSizeNum);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取菜单树' })
  async findTree() {
    return this.menuService.findTree();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取菜单详情' })
  async findOne(@Param('id') id: string) {
    return this.menuService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建菜单' })
  async create(@Body() dto: CreateMenuDto) {
    return this.menuService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新菜单' })
  async update(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.menuService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除菜单' })
  async remove(@Param('id') id: string) {
    await this.menuService.remove(id);
    return null;
  }
}