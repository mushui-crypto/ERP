import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { Customer } from '../../database/entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer])],
  providers: [CustomerService],
  controllers: [CustomerController],
  exports: [CustomerService],
})
export class CustomerModule {}
