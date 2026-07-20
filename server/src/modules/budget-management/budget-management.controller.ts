import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { BudgetManagementService } from './budget-management.service';
import { FinBudget } from '../../database/entities/fin-budget.entity';

@Controller('budget-management')
export class BudgetManagementController {
  constructor(private budgetManagementService: BudgetManagementService) {}

  @Get('statistics')
  async getBudgetStatistics() {
    return this.budgetManagementService.getBudgetStatistics();
  }

  @Get()
  async findBudgets(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('budgetType') budgetType?: string,
    @Query('status') status?: string,
  ) {
    const stat = status !== undefined ? Number(status) : undefined;
    return this.budgetManagementService.findBudgets(page, pageSize, budgetType, stat);
  }

  @Get(':id')
  async findBudgetById(@Param('id') id: string) {
    return this.budgetManagementService.findBudgetById(id);
  }

  @Get(':id/items')
  async findBudgetItems(@Param('id') budgetId: string) {
    return this.budgetManagementService.findBudgetItems(budgetId);
  }

  @Post()
  async createBudget(@Body() body: { budget: Partial<FinBudget>; items: any[] }) {
    return this.budgetManagementService.createBudget(body.budget, body.items);
  }

  @Put(':id')
  async updateBudget(@Param('id') id: string, @Body() data: Partial<FinBudget>) {
    return this.budgetManagementService.updateBudget(id, data);
  }

  @Put(':id/submit')
  async submitBudget(@Param('id') id: string) {
    return this.budgetManagementService.submitBudget(id);
  }

  @Put(':id/approve')
  async approveBudget(@Param('id') id: string, @Body('approvedBy') approvedBy: string) {
    return this.budgetManagementService.approveBudget(id, approvedBy);
  }

  @Put(':id/execute')
  async executeBudget(@Param('id') id: string) {
    return this.budgetManagementService.executeBudget(id);
  }

  @Put(':budgetId/items/:itemCode/actual')
  async updateActualAmount(
    @Param('budgetId') budgetId: string,
    @Param('itemCode') itemCode: string,
    @Body('actualAmount') actualAmount: number,
  ) {
    return this.budgetManagementService.updateActualAmount(budgetId, itemCode, actualAmount);
  }

  @Delete(':id')
  async deleteBudget(@Param('id') id: string) {
    return this.budgetManagementService.deleteBudget(id);
  }
}