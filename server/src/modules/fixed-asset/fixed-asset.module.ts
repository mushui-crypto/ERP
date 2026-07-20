import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FixedAssetController } from './fixed-asset.controller';
import { FixedAssetService } from './fixed-asset.service';
import { FinFixedAsset } from '../../database/entities/fin-fixed-asset.entity';
import { FinDepreciation } from '../../database/entities/fin-depreciation.entity';
import { FinAssetCategory } from '../../database/entities/fin-asset-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FinFixedAsset, FinDepreciation, FinAssetCategory])],
  controllers: [FixedAssetController],
  providers: [FixedAssetService],
  exports: [FixedAssetService],
})
export class FixedAssetModule {}
