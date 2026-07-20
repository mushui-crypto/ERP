import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { EntityManager, Repository } from 'typeorm';
import { PayableEntry } from '../../database/entities/payable-entry.entity';
import { Payable } from '../../database/entities/payable.entity';
import { PaymentTerm } from '../../database/entities/payment-term.entity';
import { generateDocumentNo } from '../purchase-common/purchase-status';
import { CreatePayableDto, MakePaymentDto, UpdatePayableDto } from './dto/payable.dto';

export interface CreateEstimatedPayableEntryFromPurchaseInboundInput {
  inventoryInEntryId: string;
  sourceReceiveNoticeEntryId: string;
  sourceOrderEntryId: string;
  sourceRequestEntryId?: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  materialModel?: string;
  unitId: string;
  unitCode?: string;
  unitName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  untaxedAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface CreateEstimatedPayableFromPurchaseInboundInput {
  inventoryInId: string;
  inventoryInNo: string;
  supplierId: string;
  currencyId: string;
  settleOrgId: string;
  paymentTermId: string;
  untaxedAmount: number;
  taxAmount: number;
  totalAmount: number;
  approvedAt: Date;
  period?: string;
  createdBy?: string;
  entries: CreateEstimatedPayableEntryFromPurchaseInboundInput[];
}

export interface CreateEstimatedPayableFromAssetAcceptanceInput {
  assetAcceptanceId: string;
  assetAcceptanceNo: string;
  supplierId: string;
  currencyId: string;
  settleOrgId: string;
  paymentTermId: string;
  approvedAt: Date;
  createdBy?: string;
  entries: Array<{
    assetAcceptanceEntryId: string;
    sourceReceiveNoticeEntryId: string;
    sourceOrderEntryId: string;
    sourceRequestEntryId?: string;
    materialId: string;
    materialCode: string;
    materialName: string;
    materialModel?: string;
    unitId: string;
    unitCode?: string;
    unitName?: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    untaxedAmount: number;
    taxAmount: number;
    totalAmount: number;
  }>;
}

export interface CreateEstimatedPayableFromExpenseAcceptanceInput {
  expenseAcceptanceId: string;
  expenseAcceptanceNo: string;
  supplierId: string;
  currencyId: string;
  settleOrgId: string;
  paymentTermId: string;
  approvedAt: Date;
  createdBy?: string;
  entries: Array<{
    expenseAcceptanceEntryId: string;
    sourceReceiveNoticeEntryId: string;
    sourceOrderEntryId: string;
    sourceRequestEntryId?: string;
    expenseItemCode?: string;
    expenseItemName: string;
    materialId?: string;
    materialCode?: string;
    materialName?: string;
    materialModel?: string;
    unitId?: string;
    unitCode?: string;
    unitName?: string;
    quantity: number;
    unitPrice: number;
    taxRate: number;
    untaxedAmount: number;
    taxAmount: number;
    totalAmount: number;
  }>;
}

export interface CreateRedPayableEntryFromPurchaseReturnInput {
  purchaseReturnEntryId: string;
  sourceReceiveNoticeEntryId: string;
  sourceOrderEntryId: string;
  sourceRequestEntryId?: string;
  materialId: string;
  materialCode: string;
  materialName: string;
  materialModel?: string;
  unitId: string;
  unitCode?: string;
  unitName?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  untaxedAmount: number;
  taxAmount: number;
  totalAmount: number;
}

export interface CreateRedPayableFromPurchaseReturnInput {
  purchaseReturnId: string;
  purchaseReturnNo: string;
  supplierId: string;
  currencyId: string;
  settleOrgId: string;
  paymentTermId: string;
  approvedAt: Date;
  createdBy?: string;
  entries: CreateRedPayableEntryFromPurchaseReturnInput[];
}

@Injectable()
export class PayableService {
  constructor(
    @InjectRepository(Payable)
    private readonly payableRepository: Repository<Payable>,
  ) {}

  async findAll(page = 1, pageSize = 20, supplierId?: string, status?: number) {
    const query = this.payableRepository.createQueryBuilder('p')
      .where('p.isDeleted = 0');

    if (supplierId) {
      query.andWhere('p.supplierId = :supplierId', { supplierId });
    }
    if (status !== undefined) {
      query.andWhere('p.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('p.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Payable | null> {
    return this.payableRepository.findOne({
      where: { id, isDeleted: 0 },
      relations: { entries: true },
      order: { entries: { lineNo: 'ASC' } },
    });
  }

  async findBySupplierId(supplierId: string): Promise<Payable[]> {
    return this.payableRepository.find({ where: { supplierId, isDeleted: 0 } });
  }

  generatePayableNo(): string {
    return generateDocumentNo('AP');
  }

  calculateStatus(amount: number, paidAmount: number, dueDate: Date): number {
    const now = new Date();
    const balance = amount - paidAmount;

    if (balance <= 0) return 2;
    if (paidAmount > 0) return 1;
    if (dueDate && now > dueDate) return 3;
    return 0;
  }

  async create(dto: CreatePayableDto): Promise<Payable> {
    const payableDate = new Date(dto.payableDate);
    const dueDate = new Date(dto.dueDate);
    const amount = this.round(Number(dto.amount), 2);
    const id = randomUUID();
    const payable = this.payableRepository.create({
      ...dto,
      id,
      payableNo: this.generatePayableNo(),
      payableType: 'STANDARD',
      sourceId: dto.sourceId || id,
      payableDate,
      dueDate,
      untaxedAmount: amount,
      taxAmount: 0,
      paidAmount: 0,
      balance: amount,
      amount,
      status: this.calculateStatus(amount, 0, dueDate),
    });
    return this.payableRepository.save(payable);
  }

  /**
   * 采购入库审核提交后调用：一张采购入库只生成一张暂估应付。
   * 调用方传入独立短事务的 EntityManager，来源唯一约束作为第二层幂等保护。
   */
  async createEstimatedPayableFromPurchaseInbound(
    input: CreateEstimatedPayableFromPurchaseInboundInput,
    manager: EntityManager,
  ): Promise<Payable> {
    const repository = manager.getRepository(Payable);
    const existing = await repository.findOne({
      where: {
        payableType: 'ESTIMATED',
        sourceType: 'PURCHASE_INBOUND',
        sourceId: input.inventoryInId,
        isDeleted: 0,
      },
      lock: { mode: 'pessimistic_write' },
    });
    if (existing) {
      existing.entries = await this.ensureEstimatedPayableEntries(existing.id, input, manager);
      return existing;
    }

    if (!input.entries?.length) throw new BadRequestException('采购入库没有有效明细，无法生成暂估应付');
    if (!input.paymentTermId) throw new BadRequestException('采购入库缺少付款条件，无法生成暂估应付');
    if (!input.currencyId) throw new BadRequestException('采购入库缺少结算币别，无法生成暂估应付');
    if (!input.settleOrgId) throw new BadRequestException('采购入库缺少结算组织，无法生成暂估应付');

    const paymentTerm = await manager.findOne(PaymentTerm, {
      where: { id: input.paymentTermId, isDeleted: 0, status: 1 },
      lock: { mode: 'pessimistic_read' },
    });
    if (!paymentTerm) throw new BadRequestException('付款条件不存在或未启用，无法生成暂估应付');

    const payableDate = new Date(input.approvedAt);
    const dueDate = new Date(payableDate);
    dueDate.setDate(dueDate.getDate() + Number(paymentTerm.creditDays || 0));

    const untaxedAmount = this.round(input.entries.reduce((sum, entry) => sum + Number(entry.untaxedAmount || 0), 0), 2);
    const taxAmount = this.round(input.entries.reduce((sum, entry) => sum + Number(entry.taxAmount || 0), 0), 2);
    const totalAmount = this.round(input.entries.reduce((sum, entry) => sum + Number(entry.totalAmount || 0), 0), 2);
    if (totalAmount < 0) throw new BadRequestException('采购入库价税合计不能小于0');

    const payable = repository.create({
      payableNo: this.generatePayableNo(),
      payableType: 'ESTIMATED',
      supplierId: input.supplierId,
      sourceType: 'PURCHASE_INBOUND',
      sourceId: input.inventoryInId,
      sourceNo: input.inventoryInNo,
      currencyId: input.currencyId,
      settleOrgId: input.settleOrgId,
      paymentTermId: input.paymentTermId,
      untaxedAmount,
      taxAmount,
      amount: totalAmount,
      paidAmount: 0,
      balance: totalAmount,
      payableDate,
      dueDate,
      period: input.period || this.formatPeriod(payableDate),
      status: this.calculateStatus(totalAmount, 0, dueDate),
      remark: `采购入库 ${input.inventoryInNo} 审核自动生成暂估应付`,
      createdBy: input.createdBy || null,
      updatedBy: input.createdBy || null,
    });
    const saved = await repository.save(payable);
    saved.entries = await this.ensureEstimatedPayableEntries(saved.id, input, manager);
    return saved;
  }

  private async ensureEstimatedPayableEntries(
    payableId: string,
    input: CreateEstimatedPayableFromPurchaseInboundInput,
    manager: EntityManager,
  ): Promise<PayableEntry[]> {
    if (!input.entries?.length) throw new BadRequestException('采购入库没有有效明细，无法生成暂估应付');
    const repository = manager.getRepository(PayableEntry);
    const existing = await repository.find({
      where: { payableId, isDeleted: 0 },
      order: { lineNo: 'ASC' },
      lock: { mode: 'pessimistic_write' },
    });
    if (existing.length) {
      if (existing.length !== input.entries.length) {
        throw new BadRequestException('暂估应付明细与采购入库明细数量不一致，请人工核查');
      }
      return existing;
    }

    const entries = input.entries.map((entry, index) => repository.create({
      payableId,
      lineNo: index + 1,
      inventoryInEntryId: entry.inventoryInEntryId,
      sourceReceiveNoticeEntryId: entry.sourceReceiveNoticeEntryId,
      sourceOrderEntryId: entry.sourceOrderEntryId,
      sourceRequestEntryId: entry.sourceRequestEntryId || null,
      materialId: entry.materialId,
      materialCode: entry.materialCode,
      materialName: entry.materialName,
      materialModel: entry.materialModel || null,
      unitId: entry.unitId,
      unitCode: entry.unitCode || null,
      unitName: entry.unitName || null,
      quantity: Number(entry.quantity),
      unitPrice: Number(entry.unitPrice),
      taxRate: Number(entry.taxRate || 0),
      untaxedAmount: this.round(Number(entry.untaxedAmount || 0), 2),
      taxAmount: this.round(Number(entry.taxAmount || 0), 2),
      totalAmount: this.round(Number(entry.totalAmount || 0), 2),
      createdBy: input.createdBy || null,
      updatedBy: input.createdBy || null,
    }));
    return repository.save(entries);
  }

  async createRedPayableFromPurchaseReturn(
    input: CreateRedPayableFromPurchaseReturnInput,
    manager: EntityManager,
  ): Promise<Payable> {
    const repository = manager.getRepository(Payable);
    const existing = await repository.findOne({
      where: {
        payableType: 'RED',
        sourceType: 'PURCHASE_RETURN',
        sourceId: input.purchaseReturnId,
        isDeleted: 0,
      },
      lock: { mode: 'pessimistic_write' },
    });
    if (existing) {
      existing.entries = await this.ensureRedPayableEntries(existing.id, input, manager);
      return existing;
    }
    if (!input.entries?.length) throw new BadRequestException('采购退料没有有效明细，无法生成红字应付');
    if (!input.paymentTermId) throw new BadRequestException('采购退料缺少付款条件，无法生成红字应付');
    if (!input.currencyId) throw new BadRequestException('采购退料缺少结算币别，无法生成红字应付');
    if (!input.settleOrgId) throw new BadRequestException('采购退料缺少结算组织，无法生成红字应付');

    const paymentTerm = await manager.findOne(PaymentTerm, {
      where: { id: input.paymentTermId, isDeleted: 0, status: 1 },
      lock: { mode: 'pessimistic_read' },
    });
    if (!paymentTerm) throw new BadRequestException('付款条件不存在或未启用，无法生成红字应付');
    const payableDate = new Date(input.approvedAt);
    const dueDate = new Date(payableDate);
    dueDate.setDate(dueDate.getDate() + Number(paymentTerm.creditDays || 0));

    const untaxedAmount = -Math.abs(this.round(input.entries.reduce((sum, entry) => sum + Number(entry.untaxedAmount || 0), 0), 2));
    const taxAmount = -Math.abs(this.round(input.entries.reduce((sum, entry) => sum + Number(entry.taxAmount || 0), 0), 2));
    const totalAmount = -Math.abs(this.round(input.entries.reduce((sum, entry) => sum + Number(entry.totalAmount || 0), 0), 2));
    const payable = repository.create({
      payableNo: this.generatePayableNo(),
      payableType: 'RED',
      supplierId: input.supplierId,
      sourceType: 'PURCHASE_RETURN',
      sourceId: input.purchaseReturnId,
      sourceNo: input.purchaseReturnNo,
      currencyId: input.currencyId,
      settleOrgId: input.settleOrgId,
      paymentTermId: input.paymentTermId,
      untaxedAmount,
      taxAmount,
      amount: totalAmount,
      paidAmount: 0,
      balance: totalAmount,
      payableDate,
      dueDate,
      period: this.formatPeriod(payableDate),
      status: 0,
      remark: `采购退料 ${input.purchaseReturnNo} 审核生成红字应付`,
      createdBy: input.createdBy || null,
      updatedBy: input.createdBy || null,
    });
    const saved = await repository.save(payable);
    saved.entries = await this.ensureRedPayableEntries(saved.id, input, manager);
    return saved;
  }

  private async ensureRedPayableEntries(
    payableId: string,
    input: CreateRedPayableFromPurchaseReturnInput,
    manager: EntityManager,
  ) {
    const repository = manager.getRepository(PayableEntry);
    const existing = await repository.find({ where: { payableId, isDeleted: 0 }, order: { lineNo: 'ASC' } });
    if (existing.length) {
      if (existing.length !== input.entries.length) throw new BadRequestException('红字应付明细与采购退料明细数量不一致');
      return existing;
    }
    return repository.save(input.entries.map((entry, index) => repository.create({
      payableId,
      lineNo: index + 1,
      inventoryInEntryId: null,
      purchaseReturnEntryId: entry.purchaseReturnEntryId,
      sourceReceiveNoticeEntryId: entry.sourceReceiveNoticeEntryId,
      sourceOrderEntryId: entry.sourceOrderEntryId,
      sourceRequestEntryId: entry.sourceRequestEntryId || null,
      materialId: entry.materialId,
      materialCode: entry.materialCode,
      materialName: entry.materialName,
      materialModel: entry.materialModel || null,
      unitId: entry.unitId,
      unitCode: entry.unitCode || null,
      unitName: entry.unitName || null,
      quantity: -Math.abs(Number(entry.quantity)),
      unitPrice: Number(entry.unitPrice),
      taxRate: Number(entry.taxRate || 0),
      untaxedAmount: -Math.abs(this.round(Number(entry.untaxedAmount || 0), 2)),
      taxAmount: -Math.abs(this.round(Number(entry.taxAmount || 0), 2)),
      totalAmount: -Math.abs(this.round(Number(entry.totalAmount || 0), 2)),
      createdBy: input.createdBy || null,
      updatedBy: input.createdBy || null,
    })));
  }

  async createEstimatedPayableFromAssetAcceptance(
    input: CreateEstimatedPayableFromAssetAcceptanceInput,
    manager: EntityManager,
  ) {
    const repository = manager.getRepository(Payable);
    const existing = await repository.findOne({
      where: { payableType: 'ESTIMATED', sourceType: 'ASSET_ACCEPTANCE', sourceId: input.assetAcceptanceId, isDeleted: 0 },
      relations: { entries: true },
      lock: { mode: 'pessimistic_write' },
    });
    if (existing) return existing;
    if (!input.entries.length) throw new BadRequestException('资产验收没有通过明细，无法生成暂估应付');
    if (!input.currencyId || !input.settleOrgId || !input.paymentTermId) {
      throw new BadRequestException('资产验收缺少结算组织、币别或付款条件');
    }
    const paymentTerm = await manager.findOne(PaymentTerm, {
      where: { id: input.paymentTermId, isDeleted: 0, status: 1 },
      lock: { mode: 'pessimistic_read' },
    });
    if (!paymentTerm) throw new BadRequestException('付款条件不存在或未启用，无法生成暂估应付');
    const payableDate = new Date(input.approvedAt);
    const dueDate = new Date(payableDate);
    dueDate.setDate(dueDate.getDate() + Number(paymentTerm.creditDays || 0));
    const untaxedAmount = this.round(input.entries.reduce((sum, entry) => sum + Number(entry.untaxedAmount || 0), 0), 2);
    const taxAmount = this.round(input.entries.reduce((sum, entry) => sum + Number(entry.taxAmount || 0), 0), 2);
    const totalAmount = this.round(input.entries.reduce((sum, entry) => sum + Number(entry.totalAmount || 0), 0), 2);
    const payable = await repository.save(repository.create({
      payableNo: this.generatePayableNo(),
      payableType: 'ESTIMATED',
      supplierId: input.supplierId,
      sourceType: 'ASSET_ACCEPTANCE',
      sourceId: input.assetAcceptanceId,
      sourceNo: input.assetAcceptanceNo,
      currencyId: input.currencyId,
      settleOrgId: input.settleOrgId,
      paymentTermId: input.paymentTermId,
      untaxedAmount,
      taxAmount,
      amount: totalAmount,
      paidAmount: 0,
      balance: totalAmount,
      payableDate,
      dueDate,
      period: this.formatPeriod(payableDate),
      status: this.calculateStatus(totalAmount, 0, dueDate),
      remark: `资产验收 ${input.assetAcceptanceNo} 审核生成暂估应付`,
      createdBy: input.createdBy || null,
      updatedBy: input.createdBy || null,
    }));
    payable.entries = await manager.getRepository(PayableEntry).save(input.entries.map((entry, index) =>
      manager.getRepository(PayableEntry).create({
        payableId: payable.id,
        lineNo: index + 1,
        inventoryInEntryId: null,
        purchaseReturnEntryId: null,
        assetAcceptanceEntryId: entry.assetAcceptanceEntryId,
        sourceReceiveNoticeEntryId: entry.sourceReceiveNoticeEntryId,
        sourceOrderEntryId: entry.sourceOrderEntryId,
        sourceRequestEntryId: entry.sourceRequestEntryId || null,
        materialId: entry.materialId,
        materialCode: entry.materialCode,
        materialName: entry.materialName,
        materialModel: entry.materialModel || null,
        unitId: entry.unitId,
        unitCode: entry.unitCode || null,
        unitName: entry.unitName || null,
        quantity: Number(entry.quantity),
        unitPrice: Number(entry.unitPrice),
        taxRate: Number(entry.taxRate || 0),
        untaxedAmount: this.round(Number(entry.untaxedAmount), 2),
        taxAmount: this.round(Number(entry.taxAmount), 2),
        totalAmount: this.round(Number(entry.totalAmount), 2),
        createdBy: input.createdBy || null,
        updatedBy: input.createdBy || null,
      }),
    ));
    return payable;
  }

  async createEstimatedPayableFromExpenseAcceptance(
    input: CreateEstimatedPayableFromExpenseAcceptanceInput,
    manager: EntityManager,
  ) {
    const repository = manager.getRepository(Payable);
    const existing = await repository.findOne({
      where: {
        payableType: 'ESTIMATED',
        sourceType: 'EXPENSE_ACCEPTANCE',
        sourceId: input.expenseAcceptanceId,
        isDeleted: 0,
      },
      relations: { entries: true },
      lock: { mode: 'pessimistic_write' },
    });
    if (existing) return existing;
    if (!input.entries.length) throw new BadRequestException('费用验收没有有效明细，无法生成暂估应付');
    if (!input.currencyId || !input.settleOrgId || !input.paymentTermId) {
      throw new BadRequestException('费用验收缺少结算组织、币别或付款条件');
    }
    const paymentTerm = await manager.findOne(PaymentTerm, {
      where: { id: input.paymentTermId, isDeleted: 0, status: 1 },
      lock: { mode: 'pessimistic_read' },
    });
    if (!paymentTerm) throw new BadRequestException('付款条件不存在或未启用，无法生成暂估应付');

    const payableDate = new Date(input.approvedAt);
    const dueDate = new Date(payableDate);
    dueDate.setDate(dueDate.getDate() + Number(paymentTerm.creditDays || 0));
    const untaxedAmount = this.round(
      input.entries.reduce((sum, entry) => sum + Number(entry.untaxedAmount || 0), 0),
      2,
    );
    const taxAmount = this.round(
      input.entries.reduce((sum, entry) => sum + Number(entry.taxAmount || 0), 0),
      2,
    );
    const totalAmount = this.round(
      input.entries.reduce((sum, entry) => sum + Number(entry.totalAmount || 0), 0),
      2,
    );
    if (totalAmount < 0) throw new BadRequestException('费用验收价税合计不能小于0');

    const payable = await repository.save(repository.create({
      payableNo: this.generatePayableNo(),
      payableType: 'ESTIMATED',
      supplierId: input.supplierId,
      sourceType: 'EXPENSE_ACCEPTANCE',
      sourceId: input.expenseAcceptanceId,
      sourceNo: input.expenseAcceptanceNo,
      currencyId: input.currencyId,
      settleOrgId: input.settleOrgId,
      paymentTermId: input.paymentTermId,
      untaxedAmount,
      taxAmount,
      amount: totalAmount,
      paidAmount: 0,
      balance: totalAmount,
      payableDate,
      dueDate,
      period: this.formatPeriod(payableDate),
      status: this.calculateStatus(totalAmount, 0, dueDate),
      remark: `费用验收 ${input.expenseAcceptanceNo} 审核生成暂估应付`,
      createdBy: input.createdBy || null,
      updatedBy: input.createdBy || null,
    }));
    const entryRepository = manager.getRepository(PayableEntry);
    payable.entries = await entryRepository.save(input.entries.map((entry, index) =>
      entryRepository.create({
        payableId: payable.id,
        lineNo: index + 1,
        inventoryInEntryId: null,
        purchaseReturnEntryId: null,
        assetAcceptanceEntryId: null,
        expenseAcceptanceEntryId: entry.expenseAcceptanceEntryId,
        sourceReceiveNoticeEntryId: entry.sourceReceiveNoticeEntryId,
        sourceOrderEntryId: entry.sourceOrderEntryId,
        sourceRequestEntryId: entry.sourceRequestEntryId || null,
        expenseItemCode: entry.expenseItemCode || null,
        expenseItemName: entry.expenseItemName,
        materialId: entry.materialId || null,
        materialCode: entry.materialCode || null,
        materialName: entry.materialName || null,
        materialModel: entry.materialModel || null,
        unitId: entry.unitId || null,
        unitCode: entry.unitCode || null,
        unitName: entry.unitName || null,
        quantity: Number(entry.quantity),
        unitPrice: Number(entry.unitPrice),
        taxRate: Number(entry.taxRate || 0),
        untaxedAmount: this.round(Number(entry.untaxedAmount), 2),
        taxAmount: this.round(Number(entry.taxAmount), 2),
        totalAmount: this.round(Number(entry.totalAmount), 2),
        createdBy: input.createdBy || null,
        updatedBy: input.createdBy || null,
      }),
    ));
    return payable;
  }

  async update(id: string, dto: UpdatePayableDto): Promise<Payable> {
    const payable = await this.findById(id);
    if (!payable) throw new NotFoundException('应付账款不存在');

    if (
      (payable.payableType === 'ESTIMATED' && payable.sourceType === 'PURCHASE_INBOUND') ||
      (payable.payableType === 'ESTIMATED' && payable.sourceType === 'ASSET_ACCEPTANCE') ||
      (payable.payableType === 'ESTIMATED' && payable.sourceType === 'EXPENSE_ACCEPTANCE') ||
      (payable.payableType === 'RED' && payable.sourceType === 'PURCHASE_RETURN')
    ) {
      throw new BadRequestException('采购来源应付不允许通过通用应付接口修改');
    }
    if (payable.status === 2) {
      throw new BadRequestException('已结算的应付账款不允许修改');
    }

    Object.assign(payable, dto);
    if (dto.payableDate) payable.payableDate = new Date(dto.payableDate);
    if (dto.dueDate) payable.dueDate = new Date(dto.dueDate);
    return this.payableRepository.save(payable);
  }

  async remove(id: string): Promise<void> {
    const payable = await this.findById(id);
    if (!payable) throw new NotFoundException('应付账款不存在');

    if (
      (payable.payableType === 'ESTIMATED' && payable.sourceType === 'PURCHASE_INBOUND') ||
      (payable.payableType === 'ESTIMATED' && payable.sourceType === 'ASSET_ACCEPTANCE') ||
      (payable.payableType === 'ESTIMATED' && payable.sourceType === 'EXPENSE_ACCEPTANCE') ||
      (payable.payableType === 'RED' && payable.sourceType === 'PURCHASE_RETURN')
    ) {
      throw new BadRequestException('采购来源应付不允许通过通用应付接口删除');
    }
    if (payable.paidAmount > 0) {
      throw new BadRequestException('已付款的应付账款不允许删除');
    }

    payable.isDeleted = 1;
    await this.payableRepository.save(payable);
  }

  async makePayment(id: string, dto: MakePaymentDto): Promise<Payable> {
    const payable = await this.findById(id);
    if (!payable) throw new NotFoundException('应付账款不存在');

    if (payable.status === 2) {
      throw new BadRequestException('该应付账款已全部结算');
    }

    const balance = Number(payable.balance);
    if (dto.payAmount > balance) {
      throw new BadRequestException('付款金额不能大于余额');
    }

    const newPaidAmount = Number(payable.paidAmount) + dto.payAmount;
    const newBalance = balance - dto.payAmount;
    const status = this.calculateStatus(Number(payable.amount), newPaidAmount, payable.dueDate);

    Object.assign(payable, {
      paidAmount: newPaidAmount,
      balance: newBalance,
      status,
    });

    return this.payableRepository.save(payable);
  }

  async getOverdueList(): Promise<Payable[]> {
    return this.payableRepository.find({
      where: {
        isDeleted: 0,
        status: 3,
      },
      order: { dueDate: 'ASC' },
    });
  }

  async getSummary(supplierId?: string): Promise<any> {
    const query = this.payableRepository.createQueryBuilder('p')
      .select([
        'SUM(p.amount) as totalAmount',
        'SUM(p.paidAmount) as totalPaid',
        'SUM(p.balance) as totalBalance',
      ])
      .where('p.isDeleted = 0');

    if (supplierId) {
      query.andWhere('p.supplierId = :supplierId', { supplierId });
    }

    const result = await query.getRawOne();
    return {
      totalAmount: result.totalAmount || 0,
      totalPaid: result.totalPaid || 0,
      totalBalance: result.totalBalance || 0,
    };
  }

  private round(value: number, scale: number) {
    const factor = 10 ** scale;
    return Math.round((value + Number.EPSILON) * factor) / factor;
  }

  private formatPeriod(date: Date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}
