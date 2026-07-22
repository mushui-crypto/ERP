import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrderChangeEntry } from '../../database/entities/purchase-order-change-entry.entity';
import { PurchaseOrderChange } from '../../database/entities/purchase-order-change.entity';
import { PurchaseOrderModule } from '../purchase-order/purchase-order.module';
import { PurchaseOrderChangeController } from './purchase-order-change.controller';
import { PurchaseOrderChangeService } from './purchase-order-change.service';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrderChange, PurchaseOrderChangeEntry]), PurchaseOrderModule],
  controllers: [PurchaseOrderChangeController],
  providers: [PurchaseOrderChangeService],
  exports: [PurchaseOrderChangeService],
})
export class PurchaseOrderChangeModule {}
