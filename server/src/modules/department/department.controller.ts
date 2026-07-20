import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DepartmentService } from './department.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('部门管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('departments')
export class DepartmentController {
  constructor(private readonly departmentService: DepartmentService) {}

  @Get()
  @ApiOperation({ summary: '获取部门列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.departmentService.findAll(pageNum, pageSizeNum);
  }

  @Get('parent/:parentId')
  @ApiOperation({ summary: '根据父级ID获取子部门' })
  async findByParentId(@Param('parentId') parentId: string) {
    return this.departmentService.findChildren(parentId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取部门详情' })
  async findOne(@Param('id') id: string) {
    return this.departmentService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建部门' })
  async create(@Body() data: any) {
    return this.departmentService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新部门' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.departmentService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除部门' })
  async remove(@Param('id') id: string) {
    await this.departmentService.remove(id);
    return null;
  }
}
