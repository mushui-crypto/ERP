import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { OrgService } from './org.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateOrgDto, UpdateOrgDto } from './dto/org.dto';

@ApiTags('组织管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orgs')
export class OrgController {
  constructor(private readonly orgService: OrgService) {}

  @Get()
  @ApiOperation({ summary: '获取组织列表' })
  async findAll(@Query('page') page?: string, @Query('pageSize') pageSize?: string) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.orgService.findAll(pageNum, pageSizeNum);
  }

  @Get('tree')
  @ApiOperation({ summary: '获取组织树' })
  async findTree() {
    return this.orgService.findTree();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取组织详情' })
  async findOne(@Param('id') id: string) {
    return this.orgService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建组织' })
  async create(@Body() dto: CreateOrgDto) {
    return this.orgService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新组织' })
  async update(@Param('id') id: string, @Body() dto: UpdateOrgDto) {
    return this.orgService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除组织' })
  async remove(@Param('id') id: string) {
    await this.orgService.remove(id);
    return null;
  }
}