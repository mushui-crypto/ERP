import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CostManagementController } from './cost-management.controller';
import { CostManagementService } from './cost-management.service';
import { FinCostCenter } from '../../database/entities/fin-cost-center.entity';
import { FinCostAllocation } from '../../database/entities/fin-cost-allocation.entity';
import { FinProductCost } from '../../database/entities/fin-product-cost.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FinCostCenter, FinCostAllocation, FinProductCost])],
  controllers: [CostManagementController],
  providers: [CostManagementService],
})
export class CostManagementModule {}