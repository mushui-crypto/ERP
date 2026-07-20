import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AccountingVoucher } from '../../database/entities/accounting-voucher.entity';

@Injectable()
export class AccountingVoucherService {
  constructor(
    @InjectRepository(AccountingVoucher)
    private voucherRepository: Repository<AccountingVoucher>,
  ) {}

  async findAll(page = 1, pageSize = 20) {
    const [list, total] = await this.voucherRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<AccountingVoucher | null> {
    return this.voucherRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async create(data: Partial<AccountingVoucher>): Promise<AccountingVoucher> {
    const voucher = this.voucherRepository.create(data);
    return this.voucherRepository.save(voucher);
  }

  async update(id: string, data: Partial<AccountingVoucher>): Promise<AccountingVoucher> {
    const voucher = await this.findById(id);
    if (!voucher) throw new NotFoundException('会计凭证不存在');
    Object.assign(voucher, data);
    return this.voucherRepository.save(voucher);
  }

  async remove(id: string): Promise<void> {
    const voucher = await this.findById(id);
    if (!voucher) throw new NotFoundException('会计凭证不存在');
    voucher.isDeleted = 1;
    await this.voucherRepository.save(voucher);
  }
}
