import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PositionService } from './position.service';
import { PositionController } from './position.controller';
import { Position } from '../../database/entities/position.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Position])],
  providers: [PositionService],
  controllers: [PositionController],
  exports: [PositionService],
})
export class PositionModule {}
