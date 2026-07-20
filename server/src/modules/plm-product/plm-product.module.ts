import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlmProductController } from './plm-product.controller';
import { PlmProductService } from './plm-product.service';
import { PlmProduct } from '../../database/entities/plm-product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PlmProduct])],
  controllers: [PlmProductController],
  providers: [PlmProductService],
})
export class PlmProductModule {}