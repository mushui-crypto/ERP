import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BarcodeRuleService } from './barcode-rule.service';
import { BarcodeRuleController } from './barcode-rule.controller';
import { BarcodeRule } from '../../database/entities/barcode-rule.entity';
import { SysBarcode } from '../../database/entities/sys-barcode.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BarcodeRule, SysBarcode])],
  providers: [BarcodeRuleService],
  controllers: [BarcodeRuleController],
  exports: [BarcodeRuleService],
})
export class BarcodeRuleModule {}