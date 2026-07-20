import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UnitService } from './unit.service';
import { UnitController } from './unit.controller';
import { Unit } from '../../database/entities/unit.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Unit])],
  providers: [UnitService],
  controllers: [UnitController],
  exports: [UnitService],
})
export class UnitModule {}
