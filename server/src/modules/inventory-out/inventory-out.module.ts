import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryOut } from '../../database/entities/inventory-out.entity';
import { InventoryOutEntry } from '../../database/entities/inventory-out-entry.entity';
import { AssetOutRequest } from '../../database/entities/asset-out-request.entity';
import { AssetOutRequestEntry } from '../../database/entities/asset-out-request-entry.entity';
import { AssetAcceptance } from '../../database/entities/asset-acceptance.entity';
import { AssetAcceptanceEntry } from '../../database/entities/asset-acceptance-entry.entity';
import { Warehouse } from '../../database/entities/warehouse.entity';
import { InventoryModule } from '../inventory/inventory.module';
import { FixedAssetModule } from '../fixed-asset/fixed-asset.module';
import { InventoryOutController } from './inventory-out.controller';
import { InventoryOutService } from './inventory-out.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([InventoryOut, InventoryOutEntry, AssetOutRequest, AssetOutRequestEntry, AssetAcceptance, AssetAcceptanceEntry, Warehouse]),
    InventoryModule,
    FixedAssetModule,
  ],
  controllers: [InventoryOutController],
  providers: [InventoryOutService],
  exports: [InventoryOutService],
})
export class InventoryOutModule {}
