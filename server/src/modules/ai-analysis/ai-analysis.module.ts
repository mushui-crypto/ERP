import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAnalysisController } from './ai-analysis.controller';
import { AiAnalysisService } from './ai-analysis.service';
import { AiAnalysisReport } from '../../database/entities/ai-analysis-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiAnalysisReport])],
  controllers: [AiAnalysisController],
  providers: [AiAnalysisService],
})
export class AiAnalysisModule {}