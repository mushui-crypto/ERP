import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseReceiveNoticeEntry } from '../../database/entities/purchase-receive-notice-entry.entity';
import { PurchaseReceiveNotice } from '../../database/entities/purchase-receive-notice.entity';
import { QualityInspection } from '../../database/entities/quality-inspection.entity';
import { QualityStandard } from '../../database/entities/quality-standard.entity';
import { QualityInspectionController } from './quality-inspection.controller';
import { QualityInspectionService } from './quality-inspection.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      QualityInspection,
      QualityStandard,
      PurchaseReceiveNotice,
      PurchaseReceiveNoticeEntry,
    ]),
  ],
  providers: [QualityInspectionService],
  controllers: [QualityInspectionController],
  exports: [QualityInspectionService],
})
export class QualityInspectionModule {}
