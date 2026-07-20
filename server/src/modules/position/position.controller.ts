import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PositionService } from './position.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('岗位管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('positions')
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Get()
  @ApiOperation({ summary: '获取岗位列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.positionService.findAll(pageNum, pageSizeNum);
  }

  @Get('dept/:deptId')
  @ApiOperation({ summary: '根据部门ID获取岗位' })
  async findByDeptId(@Param('deptId') deptId: string) {
    return this.positionService.findByDeptId(deptId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取岗位详情' })
  async findOne(@Param('id') id: string) {
    return this.positionService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建岗位' })
  async create(@Body() data: any) {
    return this.positionService.create(data);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新岗位' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.positionService.update(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除岗位' })
  async remove(@Param('id') id: string) {
    await this.positionService.remove(id);
    return null;
  }
}
