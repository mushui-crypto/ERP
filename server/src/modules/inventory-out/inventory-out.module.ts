import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryOut } from '../../database/entities/inventory-out.entity';
import { InventoryOutController } from './inventory-out.controller';
import { InventoryOutService } from './inventory-out.service';

@Module({
  imports: [TypeOrmModule.forFeature([InventoryOut])],
  controllers: [InventoryOutController],
  providers: [InventoryOutService],
  exports: [InventoryOutService],
})
export class InventoryOutModule {}
