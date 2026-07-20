import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../database/entities/customer.entity';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async findAll(page = 1, pageSize = 20, customerCode?: string, customerName?: string) {
    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .where('customer.isDeleted = 0');

    if (customerCode) {
      queryBuilder.andWhere('customer.customer_code LIKE :customerCode', { customerCode: `%${customerCode}%` });
    }
    if (customerName) {
      queryBuilder.andWhere('customer.customer_name LIKE :customerName', { customerName: `%${customerName}%` });
    }

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('customer.created_at', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByCode(customerCode: string): Promise<Customer | null> {
    return this.customerRepository.findOne({ where: { customerCode, isDeleted: 0 } });
  }

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const existing = await this.findByCode(dto.customerCode);
    if (existing) {
      throw new ConflictException('客户编码已存在');
    }

    if (!dto.status) dto.status = 1;
    if (!dto.customerType) dto.customerType = 1;
    if (!dto.creditPeriod) dto.creditPeriod = 30;

    const customer = this.customerRepository.create(dto);
    return this.customerRepository.save(customer);
  }

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findById(id);
    if (!customer) throw new NotFoundException('客户不存在');

    if (dto.customerCode && dto.customerCode !== customer.customerCode) {
      const existing = await this.findByCode(dto.customerCode);
      if (existing) {
        throw new ConflictException('客户编码已存在');
      }
    }

    Object.assign(customer, dto);
    return this.customerRepository.save(customer);
  }

  async remove(id: string): Promise<void> {
    const customer = await this.findById(id);
    if (!customer) throw new NotFoundException('客户不存在');
    customer.isDeleted = 1;
    await this.customerRepository.save(customer);
  }
}