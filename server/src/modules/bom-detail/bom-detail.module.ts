import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BomDetailService } from './bom-detail.service';
import { BomDetailController } from './bom-detail.controller';
import { BomDetail } from '../../database/entities/bom-detail.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BomDetail])],
  providers: [BomDetailService],
  controllers: [BomDetailController],
  exports: [BomDetailService],
})
export class BomDetailModule {}
