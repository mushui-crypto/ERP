import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PayrollService } from './payroll.service';
import { PayrollController } from './payroll.controller';
import { Payroll } from '../../database/entities/payroll.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payroll])],
  providers: [PayrollService],
  controllers: [PayrollController],
  exports: [PayrollService],
})
export class PayrollModule {}
