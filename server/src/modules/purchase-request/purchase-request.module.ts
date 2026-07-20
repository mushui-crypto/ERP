import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchaseRequestEntry } from '../../database/entities/purchase-request-entry.entity';
import { PurchaseRequest } from '../../database/entities/purchase-request.entity';
import { PurchaseRequestController } from './purchase-request.controller';
import { PurchaseRequestService } from './purchase-request.service';

@Module({
  imports: [TypeOrmModule.forFeature([PurchaseRequest, PurchaseRequestEntry])],
  controllers: [PurchaseRequestController],
  providers: [PurchaseRequestService],
  exports: [PurchaseRequestService, TypeOrmModule],
})
export class PurchaseRequestModule {}
