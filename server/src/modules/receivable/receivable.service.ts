import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Receivable } from '../../database/entities/receivable.entity';
import { CreateReceivableDto, UpdateReceivableDto, ReceivePaymentDto } from './dto/receivable.dto';

@Injectable()
export class ReceivableService {
  constructor(
    @InjectRepository(Receivable)
    private receivableRepository: Repository<Receivable>,
  ) {}

  async findAll(page = 1, pageSize = 20, customerId?: string, status?: number) {
    const query = this.receivableRepository.createQueryBuilder('r')
      .where('r.isDeleted = 0');
    
    if (customerId) {
      query.andWhere('r.customerId = :customerId', { customerId });
    }
    if (status !== undefined) {
      query.andWhere('r.status = :status', { status });
    }
    
    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('r.createdAt', 'DESC')
      .getManyAndCount();
    
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Receivable | null> {
    return this.receivableRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByCustomerId(customerId: string): Promise<Receivable[]> {
    return this.receivableRepository.find({ where: { customerId, isDeleted: 0 } });
  }

  async generateReceivableNo(): Promise<string> {
    const now = new Date();
    const prefix = 'AR';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.receivableRepository.count({
      where: { isDeleted: 0 },
    });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  calculateStatus(amount: number, receivedAmount: number, dueDate: Date): number {
    const now = new Date();
    const balance = amount - receivedAmount;
    
    if (balance <= 0) return 2;
    if (receivedAmount > 0) return 1;
    if (dueDate && now > dueDate) return 3;
    return 0;
  }

  async create(dto: CreateReceivableDto): Promise<Receivable> {
    const receivableNo = await this.generateReceivableNo();
    const dueDate = new Date(dto.dueDate);
    const status = this.calculateStatus(dto.amount, 0, dueDate);
    
    const receivable = this.receivableRepository.create({
      ...dto,
      receivableNo,
      receivedAmount: 0,
      balance: dto.amount,
      status,
    });
    return this.receivableRepository.save(receivable);
  }

  async update(id: string, dto: UpdateReceivableDto): Promise<Receivable> {
    const receivable = await this.findById(id);
    if (!receivable) throw new NotFoundException('应收账款不存在');
    
    if (receivable.status === 2) {
      throw new BadRequestException('已结算的应收账款不允许修改');
    }
    
    const updated = { ...receivable, ...dto };
    
    return this.receivableRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const receivable = await this.findById(id);
    if (!receivable) throw new NotFoundException('应收账款不存在');
    
    if (receivable.receivedAmount > 0) {
      throw new BadRequestException('已收款的应收账款不允许删除');
    }
    
    receivable.isDeleted = 1;
    await this.receivableRepository.save(receivable);
  }

  async receivePayment(id: string, dto: ReceivePaymentDto): Promise<Receivable> {
    const receivable = await this.findById(id);
    if (!receivable) throw new NotFoundException('应收账款不存在');
    
    if (receivable.status === 2) {
      throw new BadRequestException('该应收账款已全部结算');
    }
    
    const balance = Number(receivable.balance);
    if (dto.receiveAmount > balance) {
      throw new BadRequestException('收款金额不能大于余额');
    }
    
    const newReceivedAmount = Number(receivable.receivedAmount) + dto.receiveAmount;
    const newBalance = balance - dto.receiveAmount;
    
    const dueDate = receivable.dueDate;
    const status = this.calculateStatus(Number(receivable.amount), newReceivedAmount, dueDate);
    
    Object.assign(receivable, {
      receivedAmount: newReceivedAmount,
      balance: newBalance,
      status,
    });
    
    return this.receivableRepository.save(receivable);
  }

  async getOverdueList(): Promise<Receivable[]> {
    const now = new Date();
    return this.receivableRepository.find({
      where: {
        isDeleted: 0,
        status: 3,
      },
      order: { dueDate: 'ASC' },
    });
  }

  async getSummary(customerId?: string): Promise<any> {
    const query = this.receivableRepository.createQueryBuilder('r')
      .select([
        'SUM(r.amount) as totalAmount',
        'SUM(r.receivedAmount) as totalReceived',
        'SUM(r.balance) as totalBalance',
      ])
      .where('r.isDeleted = 0');
    
    if (customerId) {
      query.andWhere('r.customerId = :customerId', { customerId });
    }
    
    const result = await query.getRawOne();
    
    return {
      totalAmount: result.totalAmount || 0,
      totalReceived: result.totalReceived || 0,
      totalBalance: result.totalBalance || 0,
    };
  }
}