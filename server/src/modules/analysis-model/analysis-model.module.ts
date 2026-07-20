import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalysisModelController } from './analysis-model.controller';
import { AnalysisModelService } from './analysis-model.service';
import { AiAnalysisModel } from '../../database/entities/ai-analysis-model.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiAnalysisModel])],
  controllers: [AnalysisModelController],
  providers: [AnalysisModelService],
})
export class AnalysisModelModule {}
