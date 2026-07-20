import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProductionOrderService } from './production-order.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateProductionOrderDto, UpdateProductionOrderDto } from './dto/production-order.dto';

@ApiTags('生产订单')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('production-orders')
export class ProductionOrderController {
  constructor(private readonly productionOrderService: ProductionOrderService) {}

  @Get()
  @ApiOperation({ summary: '获取生产订单列表' })
  async findAll(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('orderNo') orderNo?: string,
    @Query('materialId') materialId?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.productionOrderService.findAll(pageNum, pageSizeNum, orderNo, materialId);
  }

  @Get('status/:status')
  @ApiOperation({ summary: '按状态查询生产订单' })
  async findByStatus(
    @Param('status') status: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const pageNum = Number(page) || 1;
    const pageSizeNum = Number(pageSize) || 20;
    return this.productionOrderService.findByStatus(Number(status), pageNum, pageSizeNum);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取生产订单详情' })
  async findOne(@Param('id') id: string) {
    return this.productionOrderService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: '创建生产订单' })
  async create(@Body() dto: CreateProductionOrderDto) {
    return this.productionOrderService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新生产订单' })
  async update(@Param('id') id: string, @Body() dto: UpdateProductionOrderDto) {
    return this.productionOrderService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除生产订单' })
  async remove(@Param('id') id: string) {
    await this.productionOrderService.remove(id);
    return null;
  }

  @Post(':id/release')
  @ApiOperation({ summary: '下达生产订单' })
  async release(@Param('id') id: string) {
    return this.productionOrderService.release(id);
  }

  @Post(':id/start')
  @ApiOperation({ summary: '开始生产' })
  async startProduction(@Param('id') id: string) {
    return this.productionOrderService.startProduction(id);
  }

  @Post(':id/progress')
  @ApiOperation({ summary: '汇报生产进度' })
  async reportProgress(
    @Param('id') id: string,
    @Body() body: { completedQty: number; scrappedQty?: number },
  ) {
    return this.productionOrderService.reportProgress(id, body.completedQty, body.scrappedQty);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '完工生产订单' })
  async complete(@Param('id') id: string) {
    return this.productionOrderService.complete(id);
  }

  @Post(':id/close')
  @ApiOperation({ summary: '关闭生产订单' })
  async close(@Param('id') id: string) {
    return this.productionOrderService.close(id);
  }

  @Post(':id/cancel')
  @ApiOperation({ summary: '取消生产订单' })
  async cancel(@Param('id') id: string) {
    return this.productionOrderService.cancel(id);
  }
}