import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountingVoucherService } from './accounting-voucher.service';
import { AccountingVoucherController } from './accounting-voucher.controller';
import { AccountingVoucher } from '../../database/entities/accounting-voucher.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AccountingVoucher])],
  providers: [AccountingVoucherService],
  controllers: [AccountingVoucherController],
  exports: [AccountingVoucherService],
})
export class AccountingVoucherModule {}
