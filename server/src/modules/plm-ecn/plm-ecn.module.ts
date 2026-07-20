import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlmEcnService } from './plm-ecn.service';
import { PlmEcnController } from './plm-ecn.controller';
import { PlmEcn } from '../../database/entities/plm-ecn.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlmEcn])],
  providers: [PlmEcnService],
  controllers: [PlmEcnController],
  exports: [PlmEcnService],
})
export class PlmEcnModule {}
