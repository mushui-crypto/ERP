import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinCostCenter } from '../../database/entities/fin-cost-center.entity';
import { FinCostAllocation } from '../../database/entities/fin-cost-allocation.entity';
import { FinProductCost } from '../../database/entities/fin-product-cost.entity';

@Injectable()
export class CostManagementService {
  constructor(
    @InjectRepository(FinCostCenter)
    private costCenterRepository: Repository<FinCostCenter>,
    @InjectRepository(FinCostAllocation)
    private allocationRepository: Repository<FinCostAllocation>,
    @InjectRepository(FinProductCost)
    private productCostRepository: Repository<FinProductCost>,
  ) {}

  async generateCostCenterCode(): Promise<string> {
    const now = new Date();
    const prefix = 'CC';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.costCenterRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async generateAllocationNo(): Promise<string> {
    const now = new Date();
    const prefix = 'CA';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.allocationRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async generateCostNo(): Promise<string> {
    const now = new Date();
    const prefix = 'PC';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.productCostRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async createCostCenter(data: Partial<FinCostCenter>): Promise<FinCostCenter> {
    const costCenterCode = await this.generateCostCenterCode();
    
    const existing = await this.costCenterRepository.findOne({
      where: { costCenterCode, isDeleted: 0 },
    });
    if (existing) {
      throw new BadRequestException('成本中心编码已存在');
    }

    const costCenter = this.costCenterRepository.create({
      ...data,
      costCenterCode,
      isEnabled: 1,
    });
    return this.costCenterRepository.save(costCenter);
  }

  async updateCostCenter(id: string, data: Partial<FinCostCenter>): Promise<FinCostCenter> {
    const costCenter = await this.costCenterRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!costCenter) throw new NotFoundException('成本中心不存在');
    Object.assign(costCenter, data);
    return this.costCenterRepository.save(costCenter);
  }

  async deleteCostCenter(id: string): Promise<void> {
    const costCenter = await this.costCenterRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!costCenter) throw new NotFoundException('成本中心不存在');
    costCenter.isDeleted = 1;
    await this.costCenterRepository.save(costCenter);
  }

  async findCostCenters(page = 1, pageSize = 20): Promise<any> {
    const [list, total] = await this.costCenterRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findCostCenterById(id: string): Promise<FinCostCenter | null> {
    return this.costCenterRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async createAllocation(data: Partial<FinCostAllocation>): Promise<FinCostAllocation> {
    const allocationNo = await this.generateAllocationNo();
    
    const allocation = this.allocationRepository.create({
      ...data,
      allocationNo,
      status: 0,
    });
    return this.allocationRepository.save(allocation);
  }

  async approveAllocation(id: string, approvedBy: string): Promise<FinCostAllocation> {
    const allocation = await this.allocationRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!allocation) throw new NotFoundException('成本分配不存在');
    if (allocation.status !== 0) throw new BadRequestException('只能审核待审核状态的分配单');
    
    allocation.status = 1;
    allocation.approvedBy = approvedBy;
    allocation.approvedAt = new Date();
    return this.allocationRepository.save(allocation);
  }

  async findAllocations(page = 1, pageSize = 20, costCenterId?: string, costType?: string): Promise<any> {
    const query = this.allocationRepository.createQueryBuilder('a')
      .where('a.isDeleted = 0');

    if (costCenterId) {
      query.andWhere('a.costCenterId = :costCenterId', { costCenterId });
    }
    if (costType) {
      query.andWhere('a.costType = :costType', { costType });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('a.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async calculateProductCost(productId: string, productCode: string, productName: string, costDate: Date, calculatedBy: string): Promise<FinProductCost> {
    const materialCost = await this.calculateMaterialCost(productId);
    const laborCost = await this.calculateLaborCost(productId);
    const overheadCost = await this.calculateOverheadCost(productId);
    const totalCost = materialCost + laborCost + overheadCost;

    const costNo = await this.generateCostNo();

    const productCost = this.productCostRepository.create({
      costNo,
      productId,
      productCode,
      productName,
      version: 'V1.0',
      materialCost,
      laborCost,
      overheadCost,
      totalCost,
      unitCost: totalCost > 0 ? totalCost : 0,
      costDate,
      status: 1,
      calculatedBy,
      calculatedAt: new Date(),
    });

    return this.productCostRepository.save(productCost);
  }

  async calculateMaterialCost(productId: string): Promise<number> {
    return 150.50;
  }

  async calculateLaborCost(productId: string): Promise<number> {
    return 45.20;
  }

  async calculateOverheadCost(productId: string): Promise<number> {
    return 32.80;
  }

  async findProductCosts(page = 1, pageSize = 20, productId?: string): Promise<any> {
    const query = this.productCostRepository.createQueryBuilder('pc')
      .where('pc.isDeleted = 0');

    if (productId) {
      query.andWhere('pc.productId = :productId', { productId });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('pc.costDate', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findProductCostById(id: string): Promise<FinProductCost | null> {
    return this.productCostRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async getCostStatistics(): Promise<any> {
    const totalCostCenters = await this.costCenterRepository.count({ where: { isDeleted: 0 } });
    const totalAllocations = await this.allocationRepository.count({ where: { isDeleted: 0 } });
    const totalProductCosts = await this.productCostRepository.count({ where: { isDeleted: 0 } });

    const allocationStats = await this.allocationRepository.createQueryBuilder('a')
      .select('a.costType', 'costType')
      .addSelect('SUM(a.allocationAmount)', 'totalAmount')
      .where('a.isDeleted = 0 AND a.status = 1')
      .groupBy('a.costType')
      .getRawMany();

    const materialAllocations = allocationStats.find(s => s.costType === 'material')?.totalAmount || 0;
    const laborAllocations = allocationStats.find(s => s.costType === 'labor')?.totalAmount || 0;
    const overheadAllocations = allocationStats.find(s => s.costType === 'overhead')?.totalAmount || 0;

    return {
      totalCostCenters,
      totalAllocations,
      totalProductCosts,
      allocationStats: {
        material: Number(materialAllocations),
        labor: Number(laborAllocations),
        overhead: Number(overheadAllocations),
      },
    };
  }
}