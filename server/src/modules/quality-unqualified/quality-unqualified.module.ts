import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualityUnqualified } from '../../database/entities/quality-unqualified.entity';
import { QualityInspection } from '../../database/entities/quality-inspection.entity';
import { QualityUnqualifiedController } from './quality-unqualified.controller';
import { QualityUnqualifiedService } from './quality-unqualified.service';

@Module({
  imports: [TypeOrmModule.forFeature([QualityUnqualified, QualityInspection])],
  controllers: [QualityUnqualifiedController],
  providers: [QualityUnqualifiedService],
  exports: [QualityUnqualifiedService],
})
export class QualityUnqualifiedModule {}
