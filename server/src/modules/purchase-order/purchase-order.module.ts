import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseOrderEntry } from '../../database/entities/purchase-order-entry.entity';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';
import { PurchaseRequestEntry } from '../../database/entities/purchase-request-entry.entity';
import { PurchaseRequest } from '../../database/entities/purchase-request.entity';
import { PurchaseOrderController } from './purchase-order.controller';
import { PurchaseOrderService } from './purchase-order.service';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseOrder, PurchaseOrderEntry, PurchaseRequest, PurchaseRequestEntry])],
  providers: [PurchaseOrderService],
  controllers: [PurchaseOrderController],
  exports: [PurchaseOrderService, TypeOrmModule],
})
export class PurchaseOrderModule {}
