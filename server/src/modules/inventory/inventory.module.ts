import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InventoryPosting } from '../../database/entities/inventory-posting.entity';
import { Inventory } from '../../database/entities/inventory.entity';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';

@Module({
  imports: [TypeOrmModule.forFeature([Inventory, InventoryPosting])],
  providers: [InventoryService],
  controllers: [InventoryController],
  exports: [InventoryService],
})
export class InventoryModule {}
