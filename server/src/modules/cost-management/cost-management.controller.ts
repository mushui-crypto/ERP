import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { CostManagementService } from './cost-management.service';
import { FinCostCenter } from '../../database/entities/fin-cost-center.entity';
import { FinCostAllocation } from '../../database/entities/fin-cost-allocation.entity';

@Controller('cost-management')
export class CostManagementController {
  constructor(private costManagementService: CostManagementService) {}

  @Get('statistics')
  async getCostStatistics() {
    return this.costManagementService.getCostStatistics();
  }

  @Get('cost-centers')
  async findCostCenters(@Query('page') page = 1, @Query('pageSize') pageSize = 20) {
    return this.costManagementService.findCostCenters(page, pageSize);
  }

  @Get('cost-centers/:id')
  async findCostCenterById(@Param('id') id: string) {
    return this.costManagementService.findCostCenterById(id);
  }

  @Post('cost-centers')
  async createCostCenter(@Body() data: Partial<FinCostCenter>) {
    return this.costManagementService.createCostCenter(data);
  }

  @Put('cost-centers/:id')
  async updateCostCenter(@Param('id') id: string, @Body() data: Partial<FinCostCenter>) {
    return this.costManagementService.updateCostCenter(id, data);
  }

  @Delete('cost-centers/:id')
  async deleteCostCenter(@Param('id') id: string) {
    return this.costManagementService.deleteCostCenter(id);
  }

  @Get('allocations')
  async findAllocations(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('costCenterId') costCenterId?: string,
    @Query('costType') costType?: string,
  ) {
    return this.costManagementService.findAllocations(page, pageSize, costCenterId, costType);
  }

  @Post('allocations')
  async createAllocation(@Body() data: Partial<FinCostAllocation>) {
    return this.costManagementService.createAllocation(data);
  }

  @Put('allocations/:id/approve')
  async approveAllocation(@Param('id') id: string, @Body('approvedBy') approvedBy: string) {
    return this.costManagementService.approveAllocation(id, approvedBy);
  }

  @Get('product-costs')
  async findProductCosts(@Query('page') page = 1, @Query('pageSize') pageSize = 20, @Query('productId') productId?: string) {
    return this.costManagementService.findProductCosts(page, pageSize, productId);
  }

  @Get('product-costs/:id')
  async findProductCostById(@Param('id') id: string) {
    return this.costManagementService.findProductCostById(id);
  }

  @Post('product-costs/calculate')
  async calculateProductCost(
    @Body('productId') productId: string,
    @Body('productCode') productCode: string,
    @Body('productName') productName: string,
    @Body('costDate') costDate: Date,
    @Body('calculatedBy') calculatedBy: string,
  ) {
    return this.costManagementService.calculateProductCost(productId, productCode, productName, costDate, calculatedBy);
  }
}