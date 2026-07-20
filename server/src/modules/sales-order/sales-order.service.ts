import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SalesOrder } from '../../database/entities/sales-order.entity';
import { SalesQuote } from '../../database/entities/sales-quote.entity';
import { CreateSalesOrderDto, UpdateSalesOrderDto } from './dto/sales-order.dto';

@Injectable()
export class SalesOrderService {
  constructor(
    @InjectRepository(SalesOrder)
    private salesOrderRepository: Repository<SalesOrder>,
    @InjectRepository(SalesQuote)
    private salesQuoteRepository: Repository<SalesQuote>,
  ) {}

  async findAll(page = 1, pageSize = 20, orderNo?: string, customerId?: string, status?: number) {
    const query = this.salesOrderRepository.createQueryBuilder('so')
      .where('so.isDeleted = 0');
    
    if (orderNo) {
      query.andWhere('so.orderNo LIKE :orderNo', { orderNo: `%${orderNo}%` });
    }
    if (customerId) {
      query.andWhere('so.customerId = :customerId', { customerId });
    }
    if (status !== undefined) {
      query.andWhere('so.status = :status', { status });
    }
    
    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('so.createdAt', 'DESC')
      .getManyAndCount();
    
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<SalesOrder | null> {
    return this.salesOrderRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByStatus(status: number, page = 1, pageSize = 20) {
    const [list, total] = await this.salesOrderRepository.findAndCount({
      where: { status, isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findByQuoteId(quoteId: string): Promise<SalesOrder[]> {
    return this.salesOrderRepository.find({
      where: { sourceId: quoteId, isDeleted: 0 },
      order: { createdAt: 'DESC' },
    });
  }

  async generateOrderNo(): Promise<string> {
    const now = new Date();
    const prefix = 'SO';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.salesOrderRepository.count({
      where: {
        isDeleted: 0,
      },
    });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreateSalesOrderDto): Promise<SalesOrder> {
    const orderNo = await this.generateOrderNo();
    const order = this.salesOrderRepository.create({
      ...dto,
      orderNo,
      status: 0,
      totalAmount: dto.totalAmount || 0,
      totalTax: dto.totalTax || 0,
      totalNetAmount: dto.totalNetAmount || 0,
    });
    return this.salesOrderRepository.save(order);
  }

  async createFromQuote(quoteId: string): Promise<SalesOrder> {
    const quote = await this.salesQuoteRepository.findOne({
      where: { id: quoteId, isDeleted: 0, status: 2 },
    });

    if (!quote) {
      throw new BadRequestException('没有找到已批准的销售报价');
    }

    const orderNo = await this.generateOrderNo();
    const order = this.salesOrderRepository.create({
      orderNo,
      customerId: quote.customerId,
      customerCode: quote.customerCode,
      customerName: quote.customerName,
      materialId: quote.materialId,
      materialCode: quote.materialCode,
      materialName: quote.materialName,
      quantity: quote.quantity,
      unitPrice: quote.unitPrice,
      totalAmount: quote.amount,
      totalTax: quote.taxAmount,
      totalNetAmount: quote.totalAmount,
      sourceId: quote.id,
      sourceNo: quote.quoteNo,
      status: 0,
    });
    const savedOrder = await this.salesOrderRepository.save(order);

    quote.status = 3;
    quote.salesOrderId = savedOrder.id;
    quote.salesOrderNo = savedOrder.orderNo;
    await this.salesQuoteRepository.save(quote);

    return savedOrder;
  }

  async update(id: string, dto: UpdateSalesOrderDto): Promise<SalesOrder> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('销售订单不存在');
    
    if (order.status >= 2) {
      throw new BadRequestException('已审核的订单不允许修改');
    }
    
    Object.assign(order, dto);
    return this.salesOrderRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('销售订单不存在');
    
    if (order.status >= 1) {
      throw new BadRequestException('已提交的订单不允许删除');
    }
    
    order.isDeleted = 1;
    await this.salesOrderRepository.save(order);
  }

  async submit(id: string): Promise<SalesOrder> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('销售订单不存在');
    
    if (order.status !== 0) {
      throw new BadRequestException('只能提交草稿状态的订单');
    }
    
    order.status = 1;
    return this.salesOrderRepository.save(order);
  }

  async approve(id: string): Promise<SalesOrder> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('销售订单不存在');
    
    if (order.status !== 1) {
      throw new BadRequestException('只能审核待审核状态的订单');
    }
    
    order.status = 2;
    return this.salesOrderRepository.save(order);
  }

  async cancel(id: string): Promise<SalesOrder> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('销售订单不存在');
    
    if (order.status >= 3) {
      throw new BadRequestException('已出库的订单不允许取消');
    }
    
    order.status = 5;
    return this.salesOrderRepository.save(order);
  }

  async close(id: string): Promise<SalesOrder> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('销售订单不存在');
    
    if (order.status !== 3) {
      throw new BadRequestException('只能关闭已出库状态的订单');
    }
    
    order.status = 4;
    return this.salesOrderRepository.save(order);
  }

  async getStatistics(period?: string): Promise<any> {
    const query = this.salesOrderRepository.createQueryBuilder('so')
      .where('so.isDeleted = 0');

    if (period === 'month') {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      query.andWhere('so.orderDate >= :startOfMonth', { startOfMonth });
    } else if (period === 'quarter') {
      const now = new Date();
      const quarter = Math.floor(now.getMonth() / 3);
      const startOfQuarter = new Date(now.getFullYear(), quarter * 3, 1);
      query.andWhere('so.orderDate >= :startOfQuarter', { startOfQuarter });
    }

    const total = await query.getCount();
    
    const byStatus = await query
      .select('so.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('so.status')
      .getRawMany();

    const totalAmount = await query
      .select('SUM(so.totalAmount)', 'total')
      .getRawOne();

    const totalNetAmount = await query
      .select('SUM(so.totalNetAmount)', 'total')
      .getRawOne();

    return {
      totalOrders: total,
      totalAmount: Number(totalAmount.total) || 0,
      totalNetAmount: Number(totalNetAmount.total) || 0,
      byStatus: byStatus.map(item => ({
        status: Number(item.status),
        count: Number(item.count),
      })),
    };
  }
}