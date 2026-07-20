import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SupplierService } from './supplier.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@ApiTags('供应商管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('suppliers')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}

  @Get()
  @ApiOperation({ summary: '获取供应商列表' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('supplierCode') supplierCode?: string,
    @Query('supplierName') supplierName?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.supplierService.findAll(pageNum, pageSizeNum, supplierCode, supplierName);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取供应商详情' })
  async findOne(@Param('id') id: string) {
    return this.supplierService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建供应商' })
  async create(@Body() dto: CreateSupplierDto) {
    return this.supplierService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新供应商' })
  async update(@Param('id') id: string, @Body() dto: UpdateSupplierDto) {
    return this.supplierService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除供应商' })
  async remove(@Param('id') id: string) {
    await this.supplierService.remove(id);
    return null;
  }
}