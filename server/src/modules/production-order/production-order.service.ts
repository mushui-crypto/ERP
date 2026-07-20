import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductionOrder } from '../../database/entities/production-order.entity';
import { CreateProductionOrderDto, UpdateProductionOrderDto } from './dto/production-order.dto';

@Injectable()
export class ProductionOrderService {
  constructor(
    @InjectRepository(ProductionOrder)
    private productionOrderRepository: Repository<ProductionOrder>,
  ) {}

  async findAll(page = 1, pageSize = 20, orderNo?: string, materialId?: string) {
    const query = this.productionOrderRepository.createQueryBuilder('po')
      .where('po.isDeleted = 0');
    
    if (orderNo) {
      query.andWhere('po.orderNo LIKE :orderNo', { orderNo: `%${orderNo}%` });
    }
    if (materialId) {
      query.andWhere('po.materialId = :materialId', { materialId });
    }
    
    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('po.createdAt', 'DESC')
      .getManyAndCount();
    
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<ProductionOrder | null> {
    return this.productionOrderRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByStatus(status: number, page = 1, pageSize = 20) {
    const [list, total] = await this.productionOrderRepository.findAndCount({
      where: { status, isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async generateOrderNo(): Promise<string> {
    const now = new Date();
    const prefix = 'WO';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.productionOrderRepository.count({
      where: {
        isDeleted: 0,
      },
    });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreateProductionOrderDto): Promise<ProductionOrder> {
    const orderNo = await this.generateOrderNo();
    const order = this.productionOrderRepository.create({
      ...dto,
      orderNo,
      status: 0,
      completedQty: 0,
      scrappedQty: 0,
      priority: dto.priority || 2,
    });
    return this.productionOrderRepository.save(order);
  }

  async update(id: string, dto: UpdateProductionOrderDto): Promise<ProductionOrder> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('生产订单不存在');
    
    if (order.status >= 1) {
      throw new BadRequestException('已下达的订单不允许修改');
    }
    
    Object.assign(order, dto);
    return this.productionOrderRepository.save(order);
  }

  async remove(id: string): Promise<void> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('生产订单不存在');
    
    if (order.status >= 1) {
      throw new BadRequestException('已下达的订单不允许删除');
    }
    
    order.isDeleted = 1;
    await this.productionOrderRepository.save(order);
  }

  async release(id: string): Promise<ProductionOrder> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('生产订单不存在');
    
    if (order.status !== 0) {
      throw new BadRequestException('只能下达草稿状态的订单');
    }
    
    order.status = 1;
    order.actualStartDate = new Date();
    return this.productionOrderRepository.save(order);
  }

  async startProduction(id: string): Promise<ProductionOrder> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('生产订单不存在');
    
    if (order.status !== 1) {
      throw new BadRequestException('只能开始已下达状态的订单');
    }
    
    order.status = 2;
    if (!order.actualStartDate) {
      order.actualStartDate = new Date();
    }
    return this.productionOrderRepository.save(order);
  }

  async reportProgress(id: string, completedQty: number, scrappedQty?: number): Promise<ProductionOrder> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('生产订单不存在');
    
    if (order.status !== 2) {
      throw new BadRequestException('只能汇报生产中状态的订单');
    }
    
    order.completedQty = completedQty;
    if (scrappedQty !== undefined) {
      order.scrappedQty = scrappedQty;
    }
    
    if (Number(order.completedQty) >= Number(order.quantity)) {
      order.status = 3;
      order.actualEndDate = new Date();
    }
    
    return this.productionOrderRepository.save(order);
  }

  async complete(id: string): Promise<ProductionOrder> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('生产订单不存在');
    
    if (order.status !== 2 && order.status !== 1) {
      throw new BadRequestException('只能完成已下达或生产中的订单');
    }
    
    order.status = 3;
    order.completedQty = order.quantity;
    if (!order.actualStartDate) {
      order.actualStartDate = new Date();
    }
    order.actualEndDate = new Date();
    return this.productionOrderRepository.save(order);
  }

  async close(id: string): Promise<ProductionOrder> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('生产订单不存在');
    
    if (order.status !== 3) {
      throw new BadRequestException('只能关闭已完工状态的订单');
    }
    
    order.status = 4;
    return this.productionOrderRepository.save(order);
  }

  async cancel(id: string): Promise<ProductionOrder> {
    const order = await this.findById(id);
    if (!order) throw new NotFoundException('生产订单不存在');
    
    if (order.status >= 3) {
      throw new BadRequestException('已完工的订单不允许取消');
    }
    
    order.status = 5;
    return this.productionOrderRepository.save(order);
  }
}