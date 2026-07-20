import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesQuote } from '../../database/entities/sales-quote.entity';
import { CreateSalesQuoteDto, UpdateSalesQuoteDto } from './dto/sales-quote.dto';

@Injectable()
export class SalesQuoteService {
  constructor(
    @InjectRepository(SalesQuote)
    private salesQuoteRepository: Repository<SalesQuote>,
  ) {}

  async findAll(page = 1, pageSize = 20, quoteNo?: string, customerCode?: string, status?: number) {
    const query = this.salesQuoteRepository.createQueryBuilder('sq')
      .where('sq.isDeleted = 0');

    if (quoteNo) {
      query.andWhere('sq.quoteNo LIKE :quoteNo', { quoteNo: `%${quoteNo}%` });
    }
    if (customerCode) {
      query.andWhere('sq.customerCode LIKE :customerCode', { customerCode: `%${customerCode}%` });
    }
    if (status !== undefined) {
      query.andWhere('sq.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('sq.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<SalesQuote | null> {
    return this.salesQuoteRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByStatus(status: number, page = 1, pageSize = 20) {
    const [list, total] = await this.salesQuoteRepository.findAndCount({
      where: { status, isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async generateQuoteNo(): Promise<string> {
    const now = new Date();
    const prefix = 'SQ';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.salesQuoteRepository.count({
      where: { isDeleted: 0 },
    });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreateSalesQuoteDto): Promise<SalesQuote> {
    const quoteNo = await this.generateQuoteNo();
    const amount = dto.unitPrice && dto.quantity 
      ? Number(dto.unitPrice) * Number(dto.quantity) 
      : 0;
    const taxRate = dto.taxRate || 0;
    const taxAmount = amount * (taxRate / 100);
    const totalAmount = amount + taxAmount;

    const quote = this.salesQuoteRepository.create({
      ...dto,
      quoteNo,
      status: 0,
      amount: dto.amount || amount,
      taxRate: taxRate,
      taxAmount: dto.taxAmount || taxAmount,
      totalAmount: dto.totalAmount || totalAmount,
      quoteDate: dto.quoteDate || new Date(),
    });
    return this.salesQuoteRepository.save(quote);
  }

  async update(id: string, dto: UpdateSalesQuoteDto): Promise<SalesQuote> {
    const quote = await this.findById(id);
    if (!quote) throw new NotFoundException('销售报价单不存在');

    if (quote.status >= 2) {
      throw new BadRequestException('已批准的报价单不允许修改');
    }

    Object.assign(quote, dto);
    if (dto.unitPrice !== undefined) {
      quote.amount = Number(quote.unitPrice) * Number(quote.quantity);
      quote.taxAmount = quote.amount * (Number(quote.taxRate) / 100);
      quote.totalAmount = quote.amount + quote.taxAmount;
    }
    return this.salesQuoteRepository.save(quote);
  }

  async remove(id: string): Promise<void> {
    const quote = await this.findById(id);
    if (!quote) throw new NotFoundException('销售报价单不存在');

    if (quote.status >= 1) {
      throw new BadRequestException('已提交的报价单不允许删除');
    }

    quote.isDeleted = 1;
    await this.salesQuoteRepository.save(quote);
  }

  async submit(id: string): Promise<SalesQuote> {
    const quote = await this.findById(id);
    if (!quote) throw new NotFoundException('销售报价单不存在');

    if (quote.status !== 0) {
      throw new BadRequestException('只能提交草稿状态的报价单');
    }

    quote.status = 1;
    return this.salesQuoteRepository.save(quote);
  }

  async approve(id: string): Promise<SalesQuote> {
    const quote = await this.findById(id);
    if (!quote) throw new NotFoundException('销售报价单不存在');

    if (quote.status !== 1) {
      throw new BadRequestException('只能审核待审核状态的报价单');
    }

    quote.status = 2;
    return this.salesQuoteRepository.save(quote);
  }

  async reject(id: string): Promise<SalesQuote> {
    const quote = await this.findById(id);
    if (!quote) throw new NotFoundException('销售报价单不存在');

    if (quote.status !== 1) {
      throw new BadRequestException('只能驳回待审核状态的报价单');
    }

    quote.status = 6;
    return this.salesQuoteRepository.save(quote);
  }

  async convertToOrder(id: string, salesOrderId: string, salesOrderNo: string): Promise<SalesQuote> {
    const quote = await this.findById(id);
    if (!quote) throw new NotFoundException('销售报价单不存在');

    if (quote.status !== 2) {
      throw new BadRequestException('只能将已批准的报价单转为订单');
    }

    quote.status = 3;
    quote.salesOrderId = salesOrderId;
    quote.salesOrderNo = salesOrderNo;
    return this.salesQuoteRepository.save(quote);
  }

  async expire(id: string): Promise<SalesQuote> {
    const quote = await this.findById(id);
    if (!quote) throw new NotFoundException('销售报价单不存在');

    if (quote.status === 3) {
      throw new BadRequestException('已转订单的报价单不允许失效');
    }

    quote.status = 4;
    return this.salesQuoteRepository.save(quote);
  }

  async cancel(id: string): Promise<SalesQuote> {
    const quote = await this.findById(id);
    if (!quote) throw new NotFoundException('销售报价单不存在');

    if (quote.status >= 3) {
      throw new BadRequestException('已转订单的报价单不允许取消');
    }

    quote.status = 5;
    return this.salesQuoteRepository.save(quote);
  }
}