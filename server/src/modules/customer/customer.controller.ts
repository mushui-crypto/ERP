import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CustomerService } from './customer.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@ApiTags('客户管理')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get()
  @ApiOperation({ summary: '获取客户列表' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('customerCode') customerCode?: string,
    @Query('customerName') customerName?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.customerService.findAll(pageNum, pageSizeNum, customerCode, customerName);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取客户详情' })
  async findOne(@Param('id') id: string) {
    return this.customerService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建客户' })
  async create(@Body() dto: CreateCustomerDto) {
    return this.customerService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新客户' })
  async update(@Param('id') id: string, @Body() dto: UpdateCustomerDto) {
    return this.customerService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除客户' })
  async remove(@Param('id') id: string) {
    await this.customerService.remove(id);
    return null;
  }
}