import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { Material } from '../../database/entities/material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Material])],
  providers: [MaterialService],
  controllers: [MaterialController],
  exports: [MaterialService],
})
export class MaterialModule {}
