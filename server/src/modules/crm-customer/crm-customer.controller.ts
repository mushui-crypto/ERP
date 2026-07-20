import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { CrmCustomerService } from './crm-customer.service';
import { CrmCustomer } from '../../database/entities/crm-customer.entity';
import { CrmCustomerCategory } from '../../database/entities/crm-customer-category.entity';
import { CrmCustomerContact } from '../../database/entities/crm-customer-contact.entity';
import { CrmCustomerFollowup } from '../../database/entities/crm-customer-followup.entity';

@Controller('crm-customers')
export class CrmCustomerController {
  constructor(private crmCustomerService: CrmCustomerService) {}

  @Get('statistics')
  async getStatistics() {
    return this.crmCustomerService.getStatistics();
  }

  @Get('categories')
  async findCategories() {
    return this.crmCustomerService.findCategories();
  }

  @Post('categories')
  async createCategory(@Body() data: Partial<CrmCustomerCategory>) {
    return this.crmCustomerService.createCategory(data);
  }

  @Put('categories/:id')
  async updateCategory(@Param('id') id: string, @Body() data: Partial<CrmCustomerCategory>) {
    return this.crmCustomerService.updateCategory(id, data);
  }

  @Delete('categories/:id')
  async deleteCategory(@Param('id') id: string) {
    return this.crmCustomerService.deleteCategory(id);
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('categoryId') categoryId?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.crmCustomerService.findAll(page, pageSize, categoryId, keyword);
  }

  @Get('360/:id')
  async getCustomer360(@Param('id') id: string) {
    return this.crmCustomerService.getCustomer360(id);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.crmCustomerService.findById(id);
  }

  @Post()
  async create(@Body() data: Partial<CrmCustomer>) {
    return this.crmCustomerService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<CrmCustomer>) {
    return this.crmCustomerService.update(id, data);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.crmCustomerService.remove(id);
  }

  @Get(':customerId/contacts')
  async findContacts(@Param('customerId') customerId: string) {
    return this.crmCustomerService.findContacts(customerId);
  }

  @Post('contacts')
  async createContact(@Body() data: Partial<CrmCustomerContact>) {
    return this.crmCustomerService.createContact(data);
  }

  @Put('contacts/:id')
  async updateContact(@Param('id') id: string, @Body() data: Partial<CrmCustomerContact>) {
    return this.crmCustomerService.updateContact(id, data);
  }

  @Delete('contacts/:id')
  async deleteContact(@Param('id') id: string) {
    return this.crmCustomerService.deleteContact(id);
  }

  @Get(':customerId/followups')
  async findFollowups(
    @Param('customerId') customerId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.crmCustomerService.findFollowups(customerId, page, pageSize);
  }

  @Post('followups')
  async createFollowup(@Body() data: Partial<CrmCustomerFollowup>) {
    return this.crmCustomerService.createFollowup(data);
  }

  @Put('followups/:id')
  async updateFollowup(@Param('id') id: string, @Body() data: Partial<CrmCustomerFollowup>) {
    return this.crmCustomerService.updateFollowup(id, data);
  }
}