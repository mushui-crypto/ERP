import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not } from 'typeorm';
import { CrmCustomer } from '../../database/entities/crm-customer.entity';
import { CrmCustomerCategory } from '../../database/entities/crm-customer-category.entity';
import { CrmCustomerContact } from '../../database/entities/crm-customer-contact.entity';
import { CrmCustomerFollowup } from '../../database/entities/crm-customer-followup.entity';

@Injectable()
export class CrmCustomerService {
  constructor(
    @InjectRepository(CrmCustomer)
    private crmCustomerRepository: Repository<CrmCustomer>,
    @InjectRepository(CrmCustomerCategory)
    private categoryRepository: Repository<CrmCustomerCategory>,
    @InjectRepository(CrmCustomerContact)
    private contactRepository: Repository<CrmCustomerContact>,
    @InjectRepository(CrmCustomerFollowup)
    private followupRepository: Repository<CrmCustomerFollowup>,
  ) {}

  async generateCustomerNo(): Promise<string> {
    const now = new Date();
    const prefix = 'CU';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.crmCustomerRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async generateContactNo(): Promise<string> {
    const now = new Date();
    const prefix = 'CC';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.contactRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async generateFollowupNo(): Promise<string> {
    const now = new Date();
    const prefix = 'CF';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.followupRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async createCategory(data: Partial<CrmCustomerCategory>): Promise<CrmCustomerCategory> {
    const category = this.categoryRepository.create({
      ...data,
      enabled: 1,
    });
    return this.categoryRepository.save(category);
  }

  async updateCategory(id: string, data: Partial<CrmCustomerCategory>): Promise<CrmCustomerCategory> {
    const category = await this.categoryRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!category) throw new NotFoundException('客户分类不存在');

    Object.assign(category, data);
    return this.categoryRepository.save(category);
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoryRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!category) throw new NotFoundException('客户分类不存在');

    const hasChildren = await this.categoryRepository.count({ where: { parentId: id, isDeleted: 0 } });
    if (hasChildren > 0) {
      throw new BadRequestException('存在子分类，不允许删除');
    }

    const hasCustomers = await this.crmCustomerRepository.count({ where: { categoryId: id, isDeleted: 0 } });
    if (hasCustomers > 0) {
      throw new BadRequestException('存在关联客户，不允许删除');
    }

    category.isDeleted = 1;
    await this.categoryRepository.save(category);
  }

  async findCategories(): Promise<CrmCustomerCategory[]> {
    return this.categoryRepository.find({ where: { isDeleted: 0 }, order: { sortOrder: 'ASC' } });
  }

  async create(data: Partial<CrmCustomer>): Promise<CrmCustomer> {
    const customerNo = await this.generateCustomerNo();
    const customer = this.crmCustomerRepository.create({
      ...data,
      customerNo,
      status: 1,
    });
    return this.crmCustomerRepository.save(customer);
  }

  async update(id: string, data: Partial<CrmCustomer>): Promise<CrmCustomer> {
    const customer = await this.crmCustomerRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!customer) throw new NotFoundException('客户不存在');
    Object.assign(customer, data);
    return this.crmCustomerRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.crmCustomerRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!customer) throw new NotFoundException('客户不存在');
    customer.isDeleted = 1;
    await this.crmCustomerRepository.save(customer);
  }

  async findAll(page = 1, pageSize = 20, categoryId?: string, keyword?: string): Promise<any> {
    const query = this.crmCustomerRepository.createQueryBuilder('c')
      .where('c.isDeleted = 0');

    if (categoryId) {
      query.andWhere('c.categoryId = :categoryId', { categoryId });
    }
    if (keyword) {
      query.andWhere('c.customerName LIKE :keyword OR c.phone LIKE :keyword OR c.customerNo LIKE :keyword', { keyword: `%${keyword}%` });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('c.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<CrmCustomer | null> {
    return this.crmCustomerRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async createContact(data: Partial<CrmCustomerContact>): Promise<CrmCustomerContact> {
    const contactNo = await this.generateContactNo();
    
    const customer = await this.crmCustomerRepository.findOne({
      where: { id: data.customerId, isDeleted: 0 },
    });
    if (!customer) throw new NotFoundException('客户不存在');

    if (data.isPrimary) {
      await this.contactRepository.update(
        { customerId: data.customerId, isPrimary: 1, isDeleted: 0 },
        { isPrimary: 0 },
      );
    }

    const contact = this.contactRepository.create({
      ...data,
      contactNo,
      customerNo: customer.customerNo,
      customerName: customer.customerName,
      enabled: 1,
    });
    return this.contactRepository.save(contact);
  }

  async updateContact(id: string, data: Partial<CrmCustomerContact>): Promise<CrmCustomerContact> {
    const contact = await this.contactRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!contact) throw new NotFoundException('联系人不存在');

    if (data.isPrimary) {
      await this.contactRepository.update(
        { customerId: contact.customerId, isPrimary: 1, isDeleted: 0, id: Not(id) },
        { isPrimary: 0 },
      );
    }

    Object.assign(contact, data);
    return this.contactRepository.save(contact);
  }

  async deleteContact(id: string): Promise<void> {
    const contact = await this.contactRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!contact) throw new NotFoundException('联系人不存在');
    contact.isDeleted = 1;
    await this.contactRepository.save(contact);
  }

  async findContacts(customerId: string): Promise<CrmCustomerContact[]> {
    return this.contactRepository.find({ where: { customerId, isDeleted: 0 } });
  }

  async createFollowup(data: Partial<CrmCustomerFollowup>): Promise<CrmCustomerFollowup> {
    const followupNo = await this.generateFollowupNo();
    
    const customer = await this.crmCustomerRepository.findOne({
      where: { id: data.customerId, isDeleted: 0 },
    });
    if (!customer) throw new NotFoundException('客户不存在');

    const followup = this.followupRepository.create({
      ...data,
      followupNo,
      customerNo: customer.customerNo,
      customerName: customer.customerName,
      isReturned: 0,
    });
    return this.followupRepository.save(followup);
  }

  async updateFollowup(id: string, data: Partial<CrmCustomerFollowup>): Promise<CrmCustomerFollowup> {
    const followup = await this.followupRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!followup) throw new NotFoundException('跟进记录不存在');
    Object.assign(followup, data);
    return this.followupRepository.save(followup);
  }

  async findFollowups(customerId: string, page = 1, pageSize = 20): Promise<any> {
    const query = this.followupRepository.createQueryBuilder('f')
      .where('f.isDeleted = 0 AND f.customerId = :customerId', { customerId });

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('f.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async getCustomer360(id: string): Promise<any> {
    const customer = await this.findById(id);
    if (!customer) throw new NotFoundException('客户不存在');

    const contacts = await this.findContacts(id);
    const followups = await this.findFollowups(id, 1, 10);

    return {
      customer,
      contacts,
      recentFollowups: followups.list,
    };
  }

  async getStatistics(): Promise<any> {
    const totalCustomers = await this.crmCustomerRepository.count({ where: { isDeleted: 0 } });
    const activeCustomers = await this.crmCustomerRepository.count({ where: { isDeleted: 0, status: 1 } });
    
    const totalContacts = await this.contactRepository.count({ where: { isDeleted: 0 } });
    const totalFollowups = await this.followupRepository.count({ where: { isDeleted: 0 } });

    const categoryStats = await this.categoryRepository.createQueryBuilder('cat')
      .leftJoin(CrmCustomer, 'c', 'cat.id = c.categoryId AND c.isDeleted = 0')
      .select(['cat.categoryName', 'COUNT(c.id) as customerCount'])
      .where('cat.isDeleted = 0')
      .groupBy('cat.id')
      .getRawMany();

    return {
      totalCustomers,
      activeCustomers,
      totalContacts,
      totalFollowups,
      categoryDistribution: categoryStats,
    };
  }
}