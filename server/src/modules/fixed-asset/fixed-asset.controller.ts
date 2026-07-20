import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { FixedAssetService } from './fixed-asset.service';
import { FinFixedAsset } from '../../database/entities/fin-fixed-asset.entity';
import { CreateAssetCategoryDto } from './dto/fixed-asset.dto';

@Controller('fixed-asset')
export class FixedAssetController {
  constructor(private fixedAssetService: FixedAssetService) {}

  @Get('statistics')
  async getAssetStatistics() {
    return this.fixedAssetService.getAssetStatistics();
  }

  @Get('categories')
  async findCategories() {
    return this.fixedAssetService.findCategories();
  }

  @Post('categories')
  async createCategory(@Body() dto: CreateAssetCategoryDto) {
    return this.fixedAssetService.createCategory(dto);
  }

  @Get()
  async findAssets(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('assetType') assetType?: string,
    @Query('status') status?: string,
  ) {
    const stat = status !== undefined ? Number(status) : undefined;
    return this.fixedAssetService.findAssets(page, pageSize, assetType, stat);
  }

  @Get(':id')
  async findAssetById(@Param('id') id: string) {
    return this.fixedAssetService.findAssetById(id);
  }

  @Post()
  async createAsset(@Body() data: Partial<FinFixedAsset>) {
    return this.fixedAssetService.createAsset(data);
  }

  @Put(':id')
  async updateAsset(@Param('id') id: string, @Body() data: Partial<FinFixedAsset>) {
    return this.fixedAssetService.updateAsset(id, data);
  }

  @Put(':id/scrap')
  async scrapAsset(@Param('id') id: string, @Body('scrappedAt') scrappedAt: Date) {
    return this.fixedAssetService.scrapAsset(id, scrappedAt);
  }

  @Put(':id/sell')
  async sellAsset(@Param('id') id: string) {
    return this.fixedAssetService.sellAsset(id);
  }

  @Delete(':id')
  async deleteAsset(@Param('id') id: string) {
    return this.fixedAssetService.deleteAsset(id);
  }

  @Get('depreciations')
  async findDepreciations(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('period') period?: string,
    @Query('assetId') assetId?: string,
  ) {
    return this.fixedAssetService.findDepreciations(page, pageSize, period, assetId);
  }

  @Post('depreciations/calculate')
  async calculateMonthlyDepreciation(@Body('period') period: string) {
    return this.fixedAssetService.calculateMonthlyDepreciation(period);
  }

  @Put('depreciations/:id/approve')
  async approveDepreciation(@Param('id') id: string, @Body('approvedBy') approvedBy: string) {
    return this.fixedAssetService.approveDepreciation(id, approvedBy);
  }
}
