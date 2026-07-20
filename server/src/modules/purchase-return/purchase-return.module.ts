import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryInEntry } from '../../database/entities/inventory-in-entry.entity';
import { InventoryIn } from '../../database/entities/inventory-in.entity';
import { PurchaseOrderEntry } from '../../database/entities/purchase-order-entry.entity';
import { PurchaseReceiveNoticeEntry } from '../../database/entities/purchase-receive-notice-entry.entity';
import { PurchaseReturnRequestEntry } from '../../database/entities/purchase-return-request-entry.entity';
import { PurchaseReturnRequest } from '../../database/entities/purchase-return-request.entity';
import { PurchaseReturnEntry } from '../../database/entities/purchase-return-entry.entity';
import { PurchaseReturn } from '../../database/entities/purchase-return.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { PayableModule } from '../payable/payable.module';
import { PurchaseReceiveNoticeModule } from '../purchase-receive-notice/purchase-receive-notice.module';
import { PurchaseReturnController } from './purchase-return.controller';
import { PurchaseReturnService } from './purchase-return.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([PurchaseReturn, PurchaseReturnEntry, PurchaseReturnRequest, PurchaseReturnRequestEntry, InventoryIn, InventoryInEntry, PurchaseReceiveNoticeEntry, PurchaseOrderEntry]),
    InventoryModule,
    PayableModule,
    PurchaseReceiveNoticeModule,
  ],
  controllers: [PurchaseReturnController],
  providers: [PurchaseReturnService],
  exports: [PurchaseReturnService],
})
export class PurchaseReturnModule {}
