import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipmentMaintenanceService } from './equipment-maintenance.service';
import { EquipmentMaintenanceController } from './equipment-maintenance.controller';
import { EquipmentMaintenance } from '../../database/entities/equipment-maintenance.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EquipmentMaintenance])],
  providers: [EquipmentMaintenanceService],
  controllers: [EquipmentMaintenanceController],
  exports: [EquipmentMaintenanceService],
})
export class EquipmentMaintenanceModule {}
