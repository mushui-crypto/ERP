import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BudgetManagementController } from './budget-management.controller';
import { BudgetManagementService } from './budget-management.service';
import { FinBudget } from '../../database/entities/fin-budget.entity';
import { FinBudgetItem } from '../../database/entities/fin-budget-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FinBudget, FinBudgetItem])],
  controllers: [BudgetManagementController],
  providers: [BudgetManagementService],
})
export class BudgetManagementModule {}