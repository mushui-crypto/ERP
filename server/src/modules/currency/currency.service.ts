import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Currency } from '../../database/entities/currency.entity';

@Injectable()
export class CurrencyService {
  constructor(
    @InjectRepository(Currency)
    private currencyRepository: Repository<Currency>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.currencyRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Currency | null> {
    return this.currencyRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async create(data: Partial<Currency>): Promise<Currency> {
    const currency = this.currencyRepository.create(data);
    return this.currencyRepository.save(currency);
  }

  async update(id: string, data: Partial<Currency>): Promise<Currency> {
    const currency = await this.findById(id);
    if (!currency) throw new NotFoundException('币种不存在');
    Object.assign(currency, data);
    return this.currencyRepository.save(currency);
  }

  async remove(id: string): Promise<void> {
    const currency = await this.findById(id);
    if (!currency) throw new NotFoundException('币种不存在');
    currency.isDeleted = 1;
    await this.currencyRepository.save(currency);
  }
}
