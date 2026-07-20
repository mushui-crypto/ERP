import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QualityStandard } from '../../database/entities/quality-standard.entity';
import { QualityItem } from '../../database/entities/quality-item.entity';
import { QualityStandardController } from './quality-standard.controller';
import { QualityStandardService } from './quality-standard.service';

@Module({
  imports: [TypeOrmModule.forFeature([QualityStandard, QualityItem])],
  controllers: [QualityStandardController],
  providers: [QualityStandardService],
  exports: [QualityStandardService],
})
export class QualityStandardModule {}
