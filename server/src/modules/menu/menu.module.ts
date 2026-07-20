import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { Menu } from '../../database/entities/menu.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Menu])],
  providers: [MenuService],
  controllers: [MenuController],
  exports: [MenuService],
})
export class MenuModule {}
