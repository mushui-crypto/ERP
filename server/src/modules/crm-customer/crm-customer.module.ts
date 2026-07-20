import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrmCustomerController } from './crm-customer.controller';
import { CrmCustomerService } from './crm-customer.service';
import { CrmCustomer } from '../../database/entities/crm-customer.entity';
import { CrmCustomerCategory } from '../../database/entities/crm-customer-category.entity';
import { CrmCustomerContact } from '../../database/entities/crm-customer-contact.entity';
import { CrmCustomerFollowup } from '../../database/entities/crm-customer-followup.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CrmCustomer, CrmCustomerCategory, CrmCustomerContact, CrmCustomerFollowup])],
  controllers: [CrmCustomerController],
  providers: [CrmCustomerService],
})
export class CrmCustomerModule {}