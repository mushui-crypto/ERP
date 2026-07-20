import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayableEntry } from '../../database/entities/payable-entry.entity';
import { Payable } from '../../database/entities/payable.entity';
import { PaymentTerm } from '../../database/entities/payment-term.entity';
import { PayableController } from './payable.controller';
import { PayableService } from './payable.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payable, PayableEntry, PaymentTerm])],
  providers: [PayableService],
  controllers: [PayableController],
  exports: [PayableService],
})
export class PayableModule {}
