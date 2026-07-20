import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Supplier } from '../../database/entities/supplier.entity';
import { CreateSupplierDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SupplierService {
  constructor(
    @InjectRepository(Supplier)
    private supplierRepository: Repository<Supplier>,
  ) {}

  async findAll(page = 1, pageSize = 20, supplierCode?: string, supplierName?: string) {
    const queryBuilder = this.supplierRepository
      .createQueryBuilder('supplier')
      .where('supplier.isDeleted = 0');

    if (supplierCode) {
      queryBuilder.andWhere('supplier.supplier_code LIKE :supplierCode', { supplierCode: `%${supplierCode}%` });
    }
    if (supplierName) {
      queryBuilder.andWhere('supplier.supplier_name LIKE :supplierName', { supplierName: `%${supplierName}%` });
    }

    const [list, total] = await queryBuilder
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('supplier.created_at', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Supplier | null> {
    return this.supplierRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByCode(supplierCode: string): Promise<Supplier | null> {
    return this.supplierRepository.findOne({ where: { supplierCode, isDeleted: 0 } });
  }

  async create(dto: CreateSupplierDto): Promise<Supplier> {
    const existing = await this.findByCode(dto.supplierCode);
    if (existing) {
      throw new ConflictException('供应商编码已存在');
    }

    if (!dto.status) dto.status = 1;
    if (!dto.supplierType) dto.supplierType = 1;

    const supplier = this.supplierRepository.create(dto);
    return this.supplierRepository.save(supplier);
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<Supplier> {
    const supplier = await this.findById(id);
    if (!supplier) throw new NotFoundException('供应商不存在');

    if (dto.supplierCode && dto.supplierCode !== supplier.supplierCode) {
      const existing = await this.findByCode(dto.supplierCode);
      if (existing) {
        throw new ConflictException('供应商编码已存在');
      }
    }

    Object.assign(supplier, dto);
    return this.supplierRepository.save(supplier);
  }

  async remove(id: string): Promise<void> {
    const supplier = await this.findById(id);
    if (!supplier) throw new NotFoundException('供应商不存在');
    supplier.isDeleted = 1;
    await this.supplierRepository.save(supplier);
  }
}