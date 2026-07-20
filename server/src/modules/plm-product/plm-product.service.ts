import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlmProduct } from '../../database/entities/plm-product.entity';

@Injectable()
export class PlmProductService {
  constructor(
    @InjectRepository(PlmProduct)
    private productRepository: Repository<PlmProduct>,
  ) {}

  async generateProductCode(): Promise<string> {
    const now = new Date();
    const prefix = 'PR';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.productRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async createProduct(data: Partial<PlmProduct>): Promise<PlmProduct> {
    const productCode = data.productCode || await this.generateProductCode();
    
    const existing = await this.productRepository.findOne({
      where: { productCode, isDeleted: 0 },
    });
    if (existing) {
      throw new BadRequestException('产品编码已存在');
    }

    const product = this.productRepository.create({
      ...data,
      productCode,
      version: 'V1.0',
      status: 1,
    });

    return this.productRepository.save(product);
  }

  async updateProduct(id: string, data: Partial<PlmProduct>): Promise<PlmProduct> {
    const product = await this.productRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!product) throw new NotFoundException('产品不存在');
    
    Object.assign(product, data);
    return this.productRepository.save(product);
  }

  async retireProduct(id: string): Promise<PlmProduct> {
    const product = await this.productRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!product) throw new NotFoundException('产品不存在');
    
    product.status = 2;
    return this.productRepository.save(product);
  }

  async deleteProduct(id: string): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!product) throw new NotFoundException('产品不存在');
    
    product.isDeleted = 1;
    await this.productRepository.save(product);
  }

  async findProducts(page = 1, pageSize = 20, productType?: string, categoryCode?: string): Promise<any> {
    const query = this.productRepository.createQueryBuilder('p')
      .where('p.isDeleted = 0');

    if (productType) {
      query.andWhere('p.productType = :productType', { productType });
    }
    if (categoryCode) {
      query.andWhere('p.categoryCode = :categoryCode', { categoryCode });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('p.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findProductById(id: string): Promise<PlmProduct | null> {
    return this.productRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findProductByCode(productCode: string): Promise<PlmProduct | null> {
    return this.productRepository.findOne({ where: { productCode, isDeleted: 0 } });
  }

  async getProductStatistics(): Promise<any> {
    const totalProducts = await this.productRepository.count({ where: { isDeleted: 0 } });
    const activeProducts = await this.productRepository.count({ where: { isDeleted: 0, status: 1 } });
    const draftProducts = await this.productRepository.count({ where: { isDeleted: 0, status: 0 } });
    const retiredProducts = await this.productRepository.count({ where: { isDeleted: 0, status: 2 } });

    const typeStats = await this.productRepository.createQueryBuilder('p')
      .select('p.productType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('p.isDeleted = 0')
      .groupBy('p.productType')
      .getRawMany();

    const categoryStats = await this.productRepository.createQueryBuilder('p')
      .select('p.categoryCode', 'category')
      .addSelect('COUNT(*)', 'count')
      .where('p.isDeleted = 0')
      .groupBy('p.categoryCode')
      .getRawMany();

    return {
      totalProducts,
      activeProducts,
      draftProducts,
      retiredProducts,
      typeStats,
      categoryStats,
    };
  }
}