import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetAcceptanceEntry } from '../../database/entities/asset-acceptance-entry.entity';
import { ExpenseAcceptanceEntry } from '../../database/entities/expense-acceptance-entry.entity';
import { InventoryInEntry } from '../../database/entities/inventory-in-entry.entity';
import { PayableEntry } from '../../database/entities/payable-entry.entity';
import { PurchaseOrderEntry } from '../../database/entities/purchase-order-entry.entity';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';
import { PurchaseReceiveNoticeEntry } from '../../database/entities/purchase-receive-notice-entry.entity';
import { PurchaseReturnEntry } from '../../database/entities/purchase-return-entry.entity';
import { PurchaseReportController } from './purchase-report.controller';
import { PurchaseReportService } from './purchase-report.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    PurchaseOrder,
    PurchaseOrderEntry,
    PurchaseReceiveNoticeEntry,
    InventoryInEntry,
    PurchaseReturnEntry,
    AssetAcceptanceEntry,
    ExpenseAcceptanceEntry,
    PayableEntry,
  ])],
  controllers: [PurchaseReportController],
  providers: [PurchaseReportService],
})
export class PurchaseReportModule {}
