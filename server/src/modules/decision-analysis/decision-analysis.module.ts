import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DecisionAnalysisService } from './decision-analysis.service';
import { DecisionAnalysisController } from './decision-analysis.controller';
import { BiDashboard } from '../../database/entities/bi-dashboard.entity';
import { BiWidget } from '../../database/entities/bi-widget.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BiDashboard, BiWidget])],
  providers: [DecisionAnalysisService],
  controllers: [DecisionAnalysisController],
  exports: [DecisionAnalysisService],
})
export class DecisionAnalysisModule {}