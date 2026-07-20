import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MetaEntityService } from './meta-entity.service';
import { MetaEntityController } from './meta-entity.controller';
import { MetaEntity } from '../../database/entities/meta-entity.entity';
import { MetaField } from '../../database/entities/meta-field.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MetaEntity, MetaField])],
  providers: [MetaEntityService],
  controllers: [MetaEntityController],
  exports: [MetaEntityService],
})
export class MetaEntityModule {}
