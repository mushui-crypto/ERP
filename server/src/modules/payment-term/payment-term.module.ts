import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentTermService } from './payment-term.service';
import { PaymentTermController } from './payment-term.controller';
import { PaymentTerm } from '../../database/entities/payment-term.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PaymentTerm])],
  providers: [PaymentTermService],
  controllers: [PaymentTermController],
  exports: [PaymentTermService],
})
export class PaymentTermModule {}
