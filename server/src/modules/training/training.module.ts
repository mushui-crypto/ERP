import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TrainingController } from './training.controller';
import { TrainingService } from './training.service';
import { TrainingPlan } from '../../database/entities/training-plan.entity';
import { TrainingRecord } from '../../database/entities/training-record.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TrainingPlan, TrainingRecord])],
  controllers: [TrainingController],
  providers: [TrainingService],
})
export class TrainingModule {}