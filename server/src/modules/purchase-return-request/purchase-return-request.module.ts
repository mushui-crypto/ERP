import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryInEntry } from '../../database/entities/inventory-in-entry.entity';
import { InventoryIn } from '../../database/entities/inventory-in.entity';
import { PurchaseReturnRequestEntry } from '../../database/entities/purchase-return-request-entry.entity';
import { PurchaseReturnRequest } from '../../database/entities/purchase-return-request.entity';
import { PurchaseReturnEntry } from '../../database/entities/purchase-return-entry.entity';
import { PurchaseReturn } from '../../database/entities/purchase-return.entity';
import { PurchaseReturnRequestController } from './purchase-return-request.controller';
import { PurchaseReturnRequestService } from './purchase-return-request.service';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseReturnRequest, PurchaseReturnRequestEntry, PurchaseReturn, PurchaseReturnEntry, InventoryIn, InventoryInEntry])],
  controllers: [PurchaseReturnRequestController],
  providers: [PurchaseReturnRequestService],
  exports: [PurchaseReturnRequestService],
})
export class PurchaseReturnRequestModule {}
