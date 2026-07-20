import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentTerm } from '../../database/entities/payment-term.entity';

@Injectable()
export class PaymentTermService {
  constructor(
    @InjectRepository(PaymentTerm)
    private paymentTermRepository: Repository<PaymentTerm>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.paymentTermRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<PaymentTerm | null> {
    return this.paymentTermRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async create(data: Partial<PaymentTerm>): Promise<PaymentTerm> {
    const paymentTerm = this.paymentTermRepository.create(data);
    return this.paymentTermRepository.save(paymentTerm);
  }

  async update(id: string, data: Partial<PaymentTerm>): Promise<PaymentTerm> {
    const paymentTerm = await this.findById(id);
    if (!paymentTerm) throw new NotFoundException('付款条件不存在');
    Object.assign(paymentTerm, data);
    return this.paymentTermRepository.save(paymentTerm);
  }

  async remove(id: string): Promise<void> {
    const paymentTerm = await this.findById(id);
    if (!paymentTerm) throw new NotFoundException('付款条件不存在');
    paymentTerm.isDeleted = 1;
    await this.paymentTermRepository.save(paymentTerm);
  }
}
