import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceRequestService } from './service-request.service';
import { ServiceRequestController } from './service-request.controller';
import { ServiceRequest } from '../../database/entities/service-request.entity';
import { SvcServiceOrder } from '../../database/entities/svc-service-order.entity';
import { SvcComplaint } from '../../database/entities/svc-complaint.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceRequest, SvcServiceOrder, SvcComplaint])],
  providers: [ServiceRequestService],
  controllers: [ServiceRequestController],
  exports: [ServiceRequestService],
})
export class ServiceRequestModule {}