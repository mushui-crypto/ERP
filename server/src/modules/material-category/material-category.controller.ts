import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MaterialCategoryService } from './material-category.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('物料分类管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('material-categories')
export class MaterialCategoryController {
  constructor(private readonly materialCategoryService: MaterialCategoryService) {}

  @Get()
  @ApiOperation({ summary: '获取物料分类列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.materialCategoryService.findAll(pageNum, pageSizeNum);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取物料分类树' })
  async findTree() {
    return this.materialCategoryService.findTree();
  }

  @Get('parent/:parentId')
  @ApiOperation({ summary: '根据父级ID获取子分类' })
  async findByParentId(@Param('parentId') parentId: string) {
    return this.materialCategoryService.findByParentId(parentId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取物料分类详情' })
  async findOne(@Param('id') id: string) {
    return this.materialCategoryService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建物料分类' })
  async create(@Body() data: any) {
    return this.materialCategoryService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新物料分类' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.materialCategoryService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除物料分类' })
  async remove(@Param('id') id: string) {
    await this.materialCategoryService.remove(id);
    return null;
  }
}
