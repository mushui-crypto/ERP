import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OptimizationController } from './optimization.controller';
import { OptimizationService } from './optimization.service';
import { AiOptimizationSuggestion } from '../../database/entities/ai-optimization-suggestion.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiOptimizationSuggestion])],
  controllers: [OptimizationController],
  providers: [OptimizationService],
})
export class OptimizationModule {}