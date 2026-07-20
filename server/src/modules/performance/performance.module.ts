import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerformanceController } from './performance.controller';
import { PerformanceService } from './performance.service';
import { PerformancePlan } from '../../database/entities/performance-plan.entity';
import { PerformanceResult } from '../../database/entities/performance-result.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PerformancePlan, PerformanceResult])],
  controllers: [PerformanceController],
  providers: [PerformanceService],
})
export class PerformanceModule {}