import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinFixedAsset } from '../../database/entities/fin-fixed-asset.entity';
import { FinDepreciation } from '../../database/entities/fin-depreciation.entity';

@Injectable()
export class FixedAssetService {
  constructor(
    @InjectRepository(FinFixedAsset)
    private assetRepository: Repository<FinFixedAsset>,
    @InjectRepository(FinDepreciation)
    private depreciationRepository: Repository<FinDepreciation>,
  ) {}

  async generateAssetNo(): Promise<string> {
    const now = new Date();
    const prefix = 'FA';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.assetRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async generateDepreciationNo(): Promise<string> {
    const now = new Date();
    const prefix = 'DP';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.depreciationRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async createAsset(data: Partial<FinFixedAsset>): Promise<FinFixedAsset> {
    const assetNo = await this.generateAssetNo();
    
    const asset = this.assetRepository.create({
      ...data,
      assetNo,
      accumulatedDepreciation: 0,
      netValue: data.purchasePrice || 0,
      status: 1,
    });

    return this.assetRepository.save(asset);
  }

  async updateAsset(id: string, data: Partial<FinFixedAsset>): Promise<FinFixedAsset> {
    const asset = await this.assetRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!asset) throw new NotFoundException('固定资产不存在');
    if (asset.status === 3 || asset.status === 4) throw new BadRequestException('已报废或已出售的资产不允许修改');
    
    Object.assign(asset, data);
    asset.netValue = Number(asset.purchasePrice) - Number(asset.accumulatedDepreciation);
    return this.assetRepository.save(asset);
  }

  async scrapAsset(id: string, scrappedAt: Date): Promise<FinFixedAsset> {
    const asset = await this.assetRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!asset) throw new NotFoundException('固定资产不存在');
    if (asset.status === 3 || asset.status === 4) throw new BadRequestException('资产已报废或已出售');
    
    asset.status = 3;
    asset.scrappedAt = scrappedAt;
    return this.assetRepository.save(asset);
  }

  async sellAsset(id: string): Promise<FinFixedAsset> {
    const asset = await this.assetRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!asset) throw new NotFoundException('固定资产不存在');
    if (asset.status === 3 || asset.status === 4) throw new BadRequestException('资产已报废或已出售');
    
    asset.status = 4;
    return this.assetRepository.save(asset);
  }

  async deleteAsset(id: string): Promise<void> {
    const asset = await this.assetRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!asset) throw new NotFoundException('固定资产不存在');
    
    asset.isDeleted = 1;
    await this.assetRepository.save(asset);
  }

  async findAssets(page = 1, pageSize = 20, assetType?: string, status?: number): Promise<any> {
    const query = this.assetRepository.createQueryBuilder('a')
      .where('a.isDeleted = 0');

    if (assetType) {
      query.andWhere('a.assetType = :assetType', { assetType });
    }
    if (status !== undefined && status !== null) {
      query.andWhere('a.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('a.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findAssetById(id: string): Promise<FinFixedAsset | null> {
    return this.assetRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  calculateDepreciation(asset: FinFixedAsset): number {
    const { purchasePrice, salvageValue, usefulLife, depreciationMethod } = asset;
    
    if (depreciationMethod === 'straight_line') {
      return (Number(purchasePrice) - Number(salvageValue)) / Number(usefulLife);
    }
    
    if (depreciationMethod === 'declining_balance') {
      const bookValue = Number(purchasePrice) - Number(asset.accumulatedDepreciation);
      const rate = 2 / Number(usefulLife);
      return bookValue * rate;
    }
    
    if (depreciationMethod === 'sum_years') {
      const remainingLife = Number(usefulLife) - Math.floor((Date.now() - new Date(asset.purchaseDate).getTime()) / (1000 * 60 * 60 * 24 * 30));
      const sumYears = Number(usefulLife) * (Number(usefulLife) + 1) / 2;
      return (Number(purchasePrice) - Number(salvageValue)) * remainingLife / sumYears;
    }
    
    return (Number(purchasePrice) - Number(salvageValue)) / Number(usefulLife);
  }

  async calculateMonthlyDepreciation(period: string): Promise<FinDepreciation[]> {
    const assets = await this.assetRepository.find({ where: { isDeleted: 0, status: 1 } });
    
    const depreciations: FinDepreciation[] = [];
    
    for (const asset of assets) {
      const monthlyDepreciation = this.calculateDepreciation(asset);
      const newAccumulatedDepreciation = Number(asset.accumulatedDepreciation) + monthlyDepreciation;
      const newNetValue = Number(asset.purchasePrice) - newAccumulatedDepreciation;

      const depreciationNo = await this.generateDepreciationNo();
      
      const depreciation = await this.depreciationRepository.save({
        depreciationNo,
        assetId: asset.id,
        assetNo: asset.assetNo,
        assetName: asset.assetName,
        depreciationPeriod: period,
        depreciationAmount: monthlyDepreciation,
        accumulatedDepreciation: newAccumulatedDepreciation,
        netValue: newNetValue,
        status: 0,
      });

      asset.accumulatedDepreciation = newAccumulatedDepreciation;
      asset.netValue = newNetValue;
      await this.assetRepository.save(asset);

      depreciations.push(depreciation);
    }

    return depreciations;
  }

  async approveDepreciation(id: string, approvedBy: string): Promise<FinDepreciation> {
    const depreciation = await this.depreciationRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!depreciation) throw new NotFoundException('折旧记录不存在');
    if (depreciation.status !== 0) throw new BadRequestException('只能审核待审核状态的折旧');
    
    depreciation.status = 1;
    depreciation.approvedBy = approvedBy;
    depreciation.approvedAt = new Date();
    return this.depreciationRepository.save(depreciation);
  }

  async findDepreciations(page = 1, pageSize = 20, period?: string, assetId?: string): Promise<any> {
    const query = this.depreciationRepository.createQueryBuilder('d')
      .where('d.isDeleted = 0');

    if (period) {
      query.andWhere('d.depreciationPeriod = :period', { period });
    }
    if (assetId) {
      query.andWhere('d.assetId = :assetId', { assetId });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('d.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async getAssetStatistics(): Promise<any> {
    const totalAssets = await this.assetRepository.count({ where: { isDeleted: 0 } });
    const inUseAssets = await this.assetRepository.count({ where: { isDeleted: 0, status: 1 } });
    const idleAssets = await this.assetRepository.count({ where: { isDeleted: 0, status: 0 } });
    const maintenanceAssets = await this.assetRepository.count({ where: { isDeleted: 0, status: 2 } });
    const scrappedAssets = await this.assetRepository.count({ where: { isDeleted: 0, status: 3 } });

    const assetValueStats = await this.assetRepository.createQueryBuilder('a')
      .select('SUM(a.purchasePrice)', 'totalPurchase')
      .addSelect('SUM(a.accumulatedDepreciation)', 'totalDepreciation')
      .addSelect('SUM(a.netValue)', 'totalNetValue')
      .where('a.isDeleted = 0')
      .getRawOne();

    const typeStats = await this.assetRepository.createQueryBuilder('a')
      .select('a.assetType', 'type')
      .addSelect('COUNT(*)', 'count')
      .addSelect('SUM(a.purchasePrice)', 'totalPrice')
      .where('a.isDeleted = 0')
      .groupBy('a.assetType')
      .getRawMany();

    return {
      totalAssets,
      inUseAssets,
      idleAssets,
      maintenanceAssets,
      scrappedAssets,
      valueStats: {
        totalPurchase: Number(assetValueStats.totalPurchase) || 0,
        totalDepreciation: Number(assetValueStats.totalDepreciation) || 0,
        totalNetValue: Number(assetValueStats.totalNetValue) || 0,
      },
      typeStats: typeStats.map(s => ({
        type: s.type,
        count: Number(s.count) || 0,
        totalPrice: Number(s.totalPrice) || 0,
      })),
    };
  }
}