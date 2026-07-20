import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrderEntry } from '../../database/entities/purchase-order-entry.entity';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';
import { InventoryInEntry } from '../../database/entities/inventory-in-entry.entity';
import { PurchaseReceiveNoticeEntry } from '../../database/entities/purchase-receive-notice-entry.entity';
import { PurchaseReceiveNoticeReversalEntry } from '../../database/entities/purchase-receive-notice-reversal-entry.entity';
import { PurchaseReceiveNoticeReversal } from '../../database/entities/purchase-receive-notice-reversal.entity';
import { PurchaseReceiveNotice } from '../../database/entities/purchase-receive-notice.entity';
import { QualityInspection } from '../../database/entities/quality-inspection.entity';
import { PurchaseReturnEntry } from '../../database/entities/purchase-return-entry.entity';
import { PurchaseReturn } from '../../database/entities/purchase-return.entity';
import { PurchaseReceiveNoticeController } from './purchase-receive-notice.controller';
import { PurchaseReceiveNoticeService } from './purchase-receive-notice.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PurchaseReceiveNotice,
      PurchaseReceiveNoticeEntry,
      PurchaseReceiveNoticeReversal,
      PurchaseReceiveNoticeReversalEntry,
      PurchaseOrder,
      PurchaseOrderEntry,
      QualityInspection,
      InventoryInEntry,
      PurchaseReturn,
      PurchaseReturnEntry,
    ]),
  ],
  providers: [PurchaseReceiveNoticeService],
  controllers: [PurchaseReceiveNoticeController],
  exports: [PurchaseReceiveNoticeService, TypeOrmModule],
})
export class PurchaseReceiveNoticeModule {}
