import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetAcceptance } from '../../database/entities/asset-acceptance.entity';
import { AssetAcceptanceEntry } from '../../database/entities/asset-acceptance-entry.entity';
import { FinAssetCategory } from '../../database/entities/fin-asset-category.entity';
import { InventoryIn } from '../../database/entities/inventory-in.entity';
import { InventoryInEntry } from '../../database/entities/inventory-in-entry.entity';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';
import { PurchaseReceiveNotice } from '../../database/entities/purchase-receive-notice.entity';
import { PurchaseReceiveNoticeEntry } from '../../database/entities/purchase-receive-notice-entry.entity';
import { FixedAssetModule } from '../fixed-asset/fixed-asset.module';
import { PayableModule } from '../payable/payable.module';
import { AssetAcceptanceController } from './asset-acceptance.controller';
import { AssetAcceptanceService } from './asset-acceptance.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AssetAcceptance, AssetAcceptanceEntry, PurchaseReceiveNotice, PurchaseReceiveNoticeEntry, InventoryIn, InventoryInEntry, PurchaseOrder, FinAssetCategory]),
    PayableModule,
    FixedAssetModule,
  ],
  controllers: [AssetAcceptanceController],
  providers: [AssetAcceptanceService],
  exports: [AssetAcceptanceService],
})
export class AssetAcceptanceModule {}
