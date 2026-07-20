import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiskAlertService } from './risk-alert.service';
import { RiskAlertController } from './risk-alert.controller';
import { RiskAlert } from '../../database/entities/risk-alert.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RiskAlert])],
  providers: [RiskAlertService],
  controllers: [RiskAlertController],
  exports: [RiskAlertService],
})
export class RiskAlertModule {}
