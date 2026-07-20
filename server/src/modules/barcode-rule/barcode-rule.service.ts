import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BarcodeRule } from '../../database/entities/barcode-rule.entity';
import { SysBarcode } from '../../database/entities/sys-barcode.entity';

@Injectable()
export class BarcodeRuleService {
  constructor(
    @InjectRepository(BarcodeRule)
    private barcodeRuleRepository: Repository<BarcodeRule>,
    @InjectRepository(SysBarcode)
    private barcodeRepository: Repository<SysBarcode>,
  ) {}

  async findAll(page = 1, pageSize = 20, ruleType?: number): Promise<any> {
    const query = this.barcodeRuleRepository.createQueryBuilder('r')
      .where('r.isDeleted = 0');

    if (ruleType !== undefined && ruleType !== null) {
      query.andWhere('r.ruleType = :ruleType', { ruleType });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('r.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<BarcodeRule | null> {
    return this.barcodeRuleRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByCode(ruleCode: string): Promise<BarcodeRule | null> {
    return this.barcodeRuleRepository.findOne({ where: { ruleCode, isDeleted: 0 } });
  }

  async create(data: Partial<BarcodeRule>): Promise<BarcodeRule> {
    const existing = await this.barcodeRuleRepository.findOne({
      where: { ruleCode: data.ruleCode, isDeleted: 0 },
    });
    if (existing) {
      throw new BadRequestException('规则编码已存在');
    }

    const rule = this.barcodeRuleRepository.create({
      ...data,
      status: 1,
    });
    return this.barcodeRuleRepository.save(rule);
  }

  async update(id: string, data: Partial<BarcodeRule>): Promise<BarcodeRule> {
    const rule = await this.findById(id);
    if (!rule) throw new NotFoundException('条码规则不存在');
    Object.assign(rule, data);
    return this.barcodeRuleRepository.save(rule);
  }

  async enable(id: string): Promise<BarcodeRule> {
    const rule = await this.findById(id);
    if (!rule) throw new NotFoundException('条码规则不存在');
    rule.status = 1;
    return this.barcodeRuleRepository.save(rule);
  }

  async disable(id: string): Promise<BarcodeRule> {
    const rule = await this.findById(id);
    if (!rule) throw new NotFoundException('条码规则不存在');
    rule.status = 0;
    return this.barcodeRuleRepository.save(rule);
  }

  async remove(id: string): Promise<void> {
    const rule = await this.findById(id);
    if (!rule) throw new NotFoundException('条码规则不存在');
    rule.isDeleted = 1;
    await this.barcodeRuleRepository.save(rule);
  }

  async generateBarcode(ruleCode: string, targetType: string, targetId?: string, targetCode?: string, targetName?: string, batchNo?: string, expiryDate?: Date): Promise<string> {
    const rule = await this.findByCode(ruleCode);
    if (!rule) throw new NotFoundException('条码规则不存在');
    if (!rule.isAutoGen) throw new BadRequestException('该规则不支持自动生成');
    if (!rule.status) throw new BadRequestException('该规则已禁用');

    const barcode = this.buildBarcode(rule);

    await this.barcodeRepository.save({
      barcode,
      ruleId: rule.id,
      ruleCode: rule.ruleCode,
      ruleName: rule.ruleName,
      barcodeType: rule.barcodeType,
      targetType,
      targetId,
      targetCode,
      targetName,
      batchNo,
      expiryDate,
      useCount: 0,
      status: 1,
    });

    return barcode;
  }

  buildBarcode(rule: BarcodeRule): string {
    const { prefix, rulePattern, length } = rule;
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
    const randomStr = Math.random().toString(36).substr(2, 6).toUpperCase();
    const sequence = String(this.generateSequence()).padStart(6, '0');

    let barcode = rulePattern
      .replace('{PREFIX}', prefix || '')
      .replace('{DATE}', dateStr)
      .replace('{TIME}', timeStr)
      .replace('{RANDOM}', randomStr)
      .replace('{SEQUENCE}', sequence);

    if (length > 0 && barcode.length > length) {
      barcode = barcode.substring(0, length);
    }

    return barcode;
  }

  generateSequence(): number {
    return Date.now() % 1000000;
  }

  async generateBatchBarcodes(ruleCode: string, count: number, targetType: string, targetId?: string, targetCode?: string, targetName?: string): Promise<string[]> {
    const rule = await this.findByCode(ruleCode);
    if (!rule) throw new NotFoundException('条码规则不存在');
    if (!rule.isAutoGen) throw new BadRequestException('该规则不支持自动生成');
    if (!rule.status) throw new BadRequestException('该规则已禁用');
    if (count > 1000) throw new BadRequestException('单次生成数量不能超过1000');

    const barcodes: string[] = [];

    for (let i = 0; i < count; i++) {
      const barcode = this.buildBarcode(rule);
      barcodes.push(barcode);

      await this.barcodeRepository.save({
        barcode,
        ruleId: rule.id,
        ruleCode: rule.ruleCode,
        ruleName: rule.ruleName,
        barcodeType: rule.barcodeType,
        targetType,
        targetId,
        targetCode,
        targetName,
        useCount: 0,
        status: 1,
      });
    }

    return barcodes;
  }

  async scanBarcode(barcode: string): Promise<any> {
    const record = await this.barcodeRepository.findOne({ where: { barcode, isDeleted: 0 } });
    if (!record) {
      return {
        found: false,
        message: '条码不存在',
      };
    }

    if (record.status === 2) {
      return {
        found: true,
        valid: false,
        message: '条码已作废',
        record,
      };
    }

    record.useCount += 1;
    record.status = 0;
    await this.barcodeRepository.save(record);

    return {
      found: true,
      valid: true,
      message: '扫描成功',
      record,
    };
  }

  async verifyBarcode(barcode: string): Promise<any> {
    const record = await this.barcodeRepository.findOne({ where: { barcode, isDeleted: 0 } });
    if (!record) {
      return {
        found: false,
        message: '条码不存在',
      };
    }

    return {
      found: true,
      valid: record.status === 1,
      message: record.status === 1 ? '条码有效' : record.status === 0 ? '条码已使用' : '条码已作废',
      record,
    };
  }

  async findBarcodes(page = 1, pageSize = 20, ruleCode?: string, targetType?: string, status?: number): Promise<any> {
    const query = this.barcodeRepository.createQueryBuilder('b')
      .where('b.isDeleted = 0');

    if (ruleCode) {
      query.andWhere('b.ruleCode = :ruleCode', { ruleCode });
    }
    if (targetType) {
      query.andWhere('b.targetType = :targetType', { targetType });
    }
    if (status !== undefined && status !== null) {
      query.andWhere('b.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('b.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async getBarcodeStatistics(): Promise<any> {
    const totalRules = await this.barcodeRuleRepository.count({ where: { isDeleted: 0 } });
    const enabledRules = await this.barcodeRuleRepository.count({ where: { isDeleted: 0, status: 1 } });

    const totalBarcodes = await this.barcodeRepository.count({ where: { isDeleted: 0 } });
    const availableBarcodes = await this.barcodeRepository.count({ where: { isDeleted: 0, status: 1 } });
    const usedBarcodes = await this.barcodeRepository.count({ where: { isDeleted: 0, status: 0 } });
    const invalidBarcodes = await this.barcodeRepository.count({ where: { isDeleted: 0, status: 2 } });

    const typeStats = await this.barcodeRuleRepository.createQueryBuilder('r')
      .select('r.ruleType', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('r.isDeleted = 0')
      .groupBy('r.ruleType')
      .getRawMany();

    const targetStats = await this.barcodeRepository.createQueryBuilder('b')
      .select('b.targetType', 'target')
      .addSelect('COUNT(*)', 'count')
      .where('b.isDeleted = 0')
      .groupBy('b.targetType')
      .getRawMany();

    return {
      totalRules,
      enabledRules,
      totalBarcodes,
      availableBarcodes,
      usedBarcodes,
      invalidBarcodes,
      typeStats,
      targetStats,
    };
  }
}