import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AssetAcceptance } from '../../database/entities/asset-acceptance.entity';
import { AssetAcceptanceEntry } from '../../database/entities/asset-acceptance-entry.entity';
import { AssetOutRequest } from '../../database/entities/asset-out-request.entity';
import { AssetOutRequestEntry } from '../../database/entities/asset-out-request-entry.entity';
import { Warehouse } from '../../database/entities/warehouse.entity';
import { InventoryOutModule } from '../inventory-out/inventory-out.module';
import { AssetOutRequestController } from './asset-out-request.controller';
import { AssetOutRequestService } from './asset-out-request.service';

@Module({
  imports: [TypeOrmModule.forFeature([AssetOutRequest, AssetOutRequestEntry, AssetAcceptance, AssetAcceptanceEntry, Warehouse]), InventoryOutModule],
  controllers: [AssetOutRequestController],
  providers: [AssetOutRequestService],
})
export class AssetOutRequestModule {}
