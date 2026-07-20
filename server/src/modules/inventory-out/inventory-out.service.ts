﻿import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InventoryOut } from '../../database/entities/inventory-out.entity';
import { CreateInventoryOutDto, UpdateInventoryOutDto } from './dto/inventory-out.dto';

@Injectable()
export class InventoryOutService {
  constructor(
    @InjectRepository(InventoryOut)
    private inventoryOutRepository: Repository<InventoryOut>,
  ) {}

  async findAll(page = 1, pageSize = 20, outNo?: string, materialCode?: string, outType?: number) {
    const query = this.inventoryOutRepository.createQueryBuilder('out')
      .where('out.isDeleted = 0');

    if (outNo) {
      query.andWhere('out.outNo LIKE :outNo', { outNo: `%${outNo}%` });
    }
    if (materialCode) {
      query.andWhere('out.materialCode LIKE :materialCode', { materialCode: `%${materialCode}%` });
    }
    if (outType !== undefined) {
      query.andWhere('out.outType = :outType', { outType });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('out.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<InventoryOut | null> {
    return this.inventoryOutRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async generateOutNo(): Promise<string> {
    const now = new Date();
    const prefix = 'OUT';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.inventoryOutRepository.count({
      where: { isDeleted: 0 },
    });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreateInventoryOutDto): Promise<InventoryOut> {
    const outNo = await this.generateOutNo();
    const unitPrice = dto.unitPrice || 0;
    const amount = dto.amount || (unitPrice * Number(dto.quantity));

    const inventoryOut = this.inventoryOutRepository.create({
      ...dto,
      outNo,
      status: 0,
      unitPrice,
      amount,
      outDate: dto.outDate || new Date(),
    });
    return this.inventoryOutRepository.save(inventoryOut);
  }

  async update(id: string, dto: UpdateInventoryOutDto): Promise<InventoryOut> {
    const inventoryOut = await this.findById(id);
    if (!inventoryOut) throw new NotFoundException('出库单不存在');

    if (inventoryOut.status >= 2) {
      throw new BadRequestException('已审核的出库单不允许修改');
    }

    Object.assign(inventoryOut, dto);
    if (dto.unitPrice !== undefined && dto.quantity !== undefined) {
      inventoryOut.amount = Number(dto.unitPrice) * Number(dto.quantity);
    }
    return this.inventoryOutRepository.save(inventoryOut);
  }

  async remove(id: string): Promise<void> {
    const inventoryOut = await this.findById(id);
    if (!inventoryOut) throw new NotFoundException('出库单不存在');

    if (inventoryOut.status >= 1) {
      throw new BadRequestException('已提交的出库单不允许删除');
    }

    inventoryOut.isDeleted = 1;
    await this.inventoryOutRepository.save(inventoryOut);
  }

  async submit(id: string): Promise<InventoryOut> {
    const inventoryOut = await this.findById(id);
    if (!inventoryOut) throw new NotFoundException('出库单不存在');

    if (inventoryOut.status !== 0) {
      throw new BadRequestException('只能提交草稿状态的出库单');
    }

    inventoryOut.status = 1;
    return this.inventoryOutRepository.save(inventoryOut);
  }

  async approve(id: string): Promise<InventoryOut> {
    const inventoryOut = await this.findById(id);
    if (!inventoryOut) throw new NotFoundException('出库单不存在');

    if (inventoryOut.status !== 1) {
      throw new BadRequestException('只能审核待审核状态的出库单');
    }

    inventoryOut.status = 2;
    return this.inventoryOutRepository.save(inventoryOut);
  }

  async reject(id: string): Promise<InventoryOut> {
    const inventoryOut = await this.findById(id);
    if (!inventoryOut) throw new NotFoundException('出库单不存在');

    if (inventoryOut.status !== 1) {
      throw new BadRequestException('只能驳回待审核状态的出库单');
    }

    inventoryOut.status = 4;
    return this.inventoryOutRepository.save(inventoryOut);
  }

  async cancel(id: string): Promise<InventoryOut> {
    const inventoryOut = await this.findById(id);
    if (!inventoryOut) throw new NotFoundException('出库单不存在');

    if (inventoryOut.status === 2) {
      throw new BadRequestException('已审核的出库单不允许取消');
    }

    inventoryOut.status = 3;
    return this.inventoryOutRepository.save(inventoryOut);
  }
}