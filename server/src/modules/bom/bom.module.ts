import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BomService } from './bom.service';
import { BomController } from './bom.controller';
import { Bom } from '../../database/entities/bom.entity';
import { BomDetail } from '../../database/entities/bom-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Bom, BomDetail])],
  providers: [BomService],
  controllers: [BomController],
  exports: [BomService],
})
export class BomModule {}
