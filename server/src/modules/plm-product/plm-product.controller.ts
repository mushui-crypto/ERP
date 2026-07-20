import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { PlmProductService } from './plm-product.service';
import { PlmProduct } from '../../database/entities/plm-product.entity';

@Controller('plm-product')
export class PlmProductController {
  constructor(private plmProductService: PlmProductService) {}

  @Get('statistics')
  async getProductStatistics() {
    return this.plmProductService.getProductStatistics();
  }

  @Get()
  async findProducts(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('productType') productType?: string,
    @Query('categoryCode') categoryCode?: string,
  ) {
    return this.plmProductService.findProducts(page, pageSize, productType, categoryCode);
  }

  @Get(':id')
  async findProductById(@Param('id') id: string) {
    return this.plmProductService.findProductById(id);
  }

  @Get('code/:productCode')
  async findProductByCode(@Param('productCode') productCode: string) {
    return this.plmProductService.findProductByCode(productCode);
  }

  @Post()
  async createProduct(@Body() data: Partial<PlmProduct>) {
    return this.plmProductService.createProduct(data);
  }

  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() data: Partial<PlmProduct>) {
    return this.plmProductService.updateProduct(id, data);
  }

  @Put(':id/retire')
  async retireProduct(@Param('id') id: string) {
    return this.plmProductService.retireProduct(id);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return this.plmProductService.deleteProduct(id);
  }
}