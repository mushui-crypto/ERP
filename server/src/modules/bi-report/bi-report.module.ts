import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BiReportService } from './bi-report.service';
import { BiReportController } from './bi-report.controller';
import { BiReport } from '../../database/entities/bi-report.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BiReport])],
  providers: [BiReportService],
  controllers: [BiReportController],
  exports: [BiReportService],
})
export class BiReportModule {}
