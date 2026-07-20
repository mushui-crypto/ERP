import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';
import { Equipment } from '../../database/entities/equipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Equipment])],
  providers: [EquipmentService],
  controllers: [EquipmentController],
  exports: [EquipmentService],
})
export class EquipmentModule {}
