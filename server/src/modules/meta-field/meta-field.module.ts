import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetaFieldService } from './meta-field.service';
import { MetaFieldController } from './meta-field.controller';
import { MetaField } from '../../database/entities/meta-field.entity';
import { MetaEntity } from '../../database/entities/meta-entity.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MetaField, MetaEntity])],
  providers: [MetaFieldService],
  controllers: [MetaFieldController],
  exports: [MetaFieldService],
})
export class MetaFieldModule {}
