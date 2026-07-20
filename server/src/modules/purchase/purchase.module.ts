import { Module } from '@nestjs/common';
import { PurchaseController } from './purchase.controller';
import { PurchaseOrderModule } from '../purchase-order/purchase-order.module';
import { PurchaseRequestModule } from '../purchase-request/purchase-request.module';

@Module({
  imports: [PurchaseOrderModule, PurchaseRequestModule],
  controllers: [PurchaseController],
})
export class PurchaseModule {}
