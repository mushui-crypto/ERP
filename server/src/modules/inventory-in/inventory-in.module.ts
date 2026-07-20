import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryInEntry } from '../../database/entities/inventory-in-entry.entity';
import { InventoryIn } from '../../database/entities/inventory-in.entity';
import { PurchaseOrderEntry } from '../../database/entities/purchase-order-entry.entity';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';
import { PurchaseReceiveNoticeEntry } from '../../database/entities/purchase-receive-notice-entry.entity';
import { PurchaseReceiveNotice } from '../../database/entities/purchase-receive-notice.entity';
import { PurchaseReturnEntry } from '../../database/entities/purchase-return-entry.entity';
import { Supplier } from '../../database/entities/supplier.entity';
import { Warehouse } from '../../database/entities/warehouse.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { PayableModule } from '../payable/payable.module';
import { InventoryInController } from './inventory-in.controller';
import { InventoryInService } from './inventory-in.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InventoryIn,
      InventoryInEntry,
      PurchaseReceiveNotice,
      PurchaseReceiveNoticeEntry,
      PurchaseOrder,
      PurchaseOrderEntry,
      PurchaseReturnEntry,
      Supplier,
      Warehouse,
    ]),
    InventoryModule,
    PayableModule,
  ],
  controllers: [InventoryInController],
  providers: [InventoryInService],
  exports: [InventoryInService],
})
export class InventoryInModule {}
