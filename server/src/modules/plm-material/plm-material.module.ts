import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlmMaterialController } from './plm-material.controller';
import { PlmMaterialService } from './plm-material.service';
import { PlmMaterial } from '../../database/entities/plm-material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlmMaterial])],
  controllers: [PlmMaterialController],
  providers: [PlmMaterialService],
})
export class PlmMaterialModule {}