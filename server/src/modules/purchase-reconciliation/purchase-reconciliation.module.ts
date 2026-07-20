import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetAcceptanceEntry } from '../../database/entities/asset-acceptance-entry.entity';
import { ExpenseAcceptanceEntry } from '../../database/entities/expense-acceptance-entry.entity';
import { InventoryInEntry } from '../../database/entities/inventory-in-entry.entity';
import { PayableEntry } from '../../database/entities/payable-entry.entity';
import { Payable } from '../../database/entities/payable.entity';
import { PurchaseOrderEntry } from '../../database/entities/purchase-order-entry.entity';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';
import { PurchaseReconciliationEntry } from '../../database/entities/purchase-reconciliation-entry.entity';
import { PurchaseReconciliation } from '../../database/entities/purchase-reconciliation.entity';
import { PurchaseReturnEntry } from '../../database/entities/purchase-return-entry.entity';
import { PurchaseReconciliationController } from './purchase-reconciliation.controller';
import { PurchaseReconciliationService } from './purchase-reconciliation.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    PurchaseReconciliation,
    PurchaseReconciliationEntry,
    PurchaseOrder,
    PurchaseOrderEntry,
    InventoryInEntry,
    PurchaseReturnEntry,
    Payable,
    PayableEntry,
    AssetAcceptanceEntry,
    ExpenseAcceptanceEntry,
  ])],
  controllers: [PurchaseReconciliationController],
  providers: [PurchaseReconciliationService],
  exports: [PurchaseReconciliationService],
})
export class PurchaseReconciliationModule {}
