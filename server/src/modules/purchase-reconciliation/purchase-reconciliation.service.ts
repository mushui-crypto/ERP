import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { AssetAcceptanceEntry } from '../../database/entities/asset-acceptance-entry.entity';
import { ExpenseAcceptanceEntry } from '../../database/entities/expense-acceptance-entry.entity';
import { InventoryInEntry } from '../../database/entities/inventory-in-entry.entity';
import { PayableEntry } from '../../database/entities/payable-entry.entity';
import { Payable } from '../../database/entities/payable.entity';
import { PurchaseOrderEntry } from '../../database/entities/purchase-order-entry.entity';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';
import { PurchaseReconciliationEntry } from '../../database/entities/purchase-reconciliation-entry.entity';
import { PurchaseReconciliation } from '../../database/entities/purchase-reconciliation.entity';
import { PurchaseReturnEntry } from '../../database/entities/purchase-return-entry.entity';
import { generateDocumentNo, withStatusMeta } from '../purchase-common/purchase-status';
import {
  CancelPurchaseReconciliationDto,
  ConfirmPurchaseReconciliationDto,
  GeneratePurchaseReconciliationDto,
} from './dto/purchase-reconciliation.dto';
import {
  PURCHASE_RECONCILIATION_STATUS_META,
  PurchaseReconciliationStatus,
} from './purchase-reconciliation.status';

type ReconciliationLine = Partial<PurchaseReconciliationEntry>;

@Injectable()
export class PurchaseReconciliationService {
  constructor(
    @InjectRepository(PurchaseReconciliation)
    private readonly repository: Repository<PurchaseReconciliation>,
    @InjectRepository(PurchaseReconciliationEntry)
    private readonly entryRepository: Repository<PurchaseReconciliationEntry>,
    private readonly dataSource: DataSource,
  ) {}

  private round(value: number, digits: number) {
    return Number(Number(value || 0).toFixed(digits));
  }

  private present(entity: PurchaseReconciliation) {
    const value = withStatusMeta({
      ...entity,
      businessQty: Number(entity.businessQty || 0),
      businessUntaxedAmount: Number(entity.businessUntaxedAmount || 0),
      businessTaxAmount: Number(entity.businessTaxAmount || 0),
      businessTotalAmount: Number(entity.businessTotalAmount || 0),
      payableQty: Number(entity.payableQty || 0),
      payableUntaxedAmount: Number(entity.payableUntaxedAmount || 0),
      payableTaxAmount: Number(entity.payableTaxAmount || 0),
      payableTotalAmount: Number(entity.payableTotalAmount || 0),
      differenceQty: Number(entity.differenceQty || 0),
      differenceUntaxedAmount: Number(entity.differenceUntaxedAmount || 0),
      differenceTaxAmount: Number(entity.differenceTaxAmount || 0),
      differenceTotalAmount: Number(entity.differenceTotalAmount || 0),
      entries: (entity.entries || []).filter((entry) => entry.isDeleted === 0).map((entry) => ({
        ...entry,
        businessQty: Number(entry.businessQty || 0),
        businessUnitPrice: Number(entry.businessUnitPrice || 0),
        businessTaxRate: Number(entry.businessTaxRate || 0),
        businessUntaxedAmount: Number(entry.businessUntaxedAmount || 0),
        businessTaxAmount: Number(entry.businessTaxAmount || 0),
        businessTotalAmount: Number(entry.businessTotalAmount || 0),
        payableQty: Number(entry.payableQty || 0),
        payableUnitPrice: Number(entry.payableUnitPrice || 0),
        payableTaxRate: Number(entry.payableTaxRate || 0),
        payableUntaxedAmount: Number(entry.payableUntaxedAmount || 0),
        payableTaxAmount: Number(entry.payableTaxAmount || 0),
        payableTotalAmount: Number(entry.payableTotalAmount || 0),
        confirmedQty: entry.confirmedQty === null ? null : Number(entry.confirmedQty),
        confirmedUnitPrice: entry.confirmedUnitPrice === null ? null : Number(entry.confirmedUnitPrice),
        confirmedUntaxedAmount: entry.confirmedUntaxedAmount === null ? null : Number(entry.confirmedUntaxedAmount),
        confirmedTaxAmount: entry.confirmedTaxAmount === null ? null : Number(entry.confirmedTaxAmount),
        confirmedTotalAmount: entry.confirmedTotalAmount === null ? null : Number(entry.confirmedTotalAmount),
        differenceQty: Number(entry.differenceQty || 0),
        differenceUntaxedAmount: Number(entry.differenceUntaxedAmount || 0),
        differenceTaxAmount: Number(entry.differenceTaxAmount || 0),
        differenceTotalAmount: Number(entry.differenceTotalAmount || 0),
      })),
    }, PURCHASE_RECONCILIATION_STATUS_META);
    return {
      ...value,
      availableActions: entity.status === PurchaseReconciliationStatus.GENERATED ? ['CONFIRM', 'CANCEL'] : [],
    };
  }

  private async findEntityById(id: string, manager?: EntityManager, lock = false) {
    const repository = manager ? manager.getRepository(PurchaseReconciliation) : this.repository;
    return repository.findOne({
      where: { id, isDeleted: 0 },
      relations: { entries: true },
      order: { entries: { lineNo: 'ASC' } },
      ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}),
    });
  }

  async findAll(page = 1, pageSize = 20, supplierId?: string, purchaseOrgId?: string, status?: number) {
    const query = this.repository.createQueryBuilder('header').where('header.isDeleted = 0');
    if (supplierId) query.andWhere('header.supplierId = :supplierId', { supplierId });
    if (purchaseOrgId) query.andWhere('header.purchaseOrgId = :purchaseOrgId', { purchaseOrgId });
    if (status !== undefined) query.andWhere('header.status = :status', { status });
    const [list, total] = await query.orderBy('header.createdAt', 'DESC')
      .skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { list: list.map((item) => this.present(item)), total, page, pageSize };
  }

  async findById(id: string) {
    const entity = await this.findEntityById(id);
    if (!entity) throw new NotFoundException('采购对账单不存在');
    return this.present(entity);
  }

  private normalizePeriod(dto: GeneratePurchaseReconciliationDto) {
    const start = new Date(dto.periodStart);
    const endInclusive = new Date(dto.periodEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(endInclusive.getTime())) throw new BadRequestException('对账期间格式无效');
    start.setHours(0, 0, 0, 0);
    endInclusive.setHours(0, 0, 0, 0);
    if (endInclusive.getTime() < start.getTime()) throw new BadRequestException('对账期间结束日期不能早于开始日期');
    const endExclusive = new Date(endInclusive);
    endExclusive.setDate(endExclusive.getDate() + 1);
    return { start, endInclusive, endExclusive };
  }

  private hashes(dto: GeneratePurchaseReconciliationDto) {
    const normalized = {
      supplierId: dto.supplierId,
      purchaseOrgId: dto.purchaseOrgId,
      settleOrgId: dto.settleOrgId,
      currencyId: dto.currencyId,
      periodStart: dto.periodStart.slice(0, 10),
      periodEnd: dto.periodEnd.slice(0, 10),
      purchaseOrderId: dto.purchaseOrderId || null,
    };
    const scopeKey = createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
    const payloadHash = createHash('sha256').update(JSON.stringify({
      ...normalized,
      reconciliationDate: dto.reconciliationDate || null,
      remark: dto.remark || null,
    })).digest('hex');
    return { scopeKey, payloadHash };
  }

  private async assertIdempotent(existing: PurchaseReconciliation, payloadHash: string) {
    if (existing.payloadHash !== payloadHash) throw new ConflictException('相同幂等键对应的采购对账载荷不一致');
    const loaded = await this.findEntityById(existing.id);
    return this.present(loaded || existing);
  }

  private payableValues(entry?: PayableEntry) {
    return {
      payableId: entry?.payableId || null,
      payableNo: entry?.payable?.payableNo || null,
      payableEntryId: entry?.id || null,
      payableType: entry?.payable?.payableType || null,
      payableQty: Number(entry?.quantity || 0),
      payableUnitPrice: Number(entry?.unitPrice || 0),
      payableTaxRate: Number(entry?.taxRate || 0),
      payableUntaxedAmount: Number(entry?.untaxedAmount || 0),
      payableTaxAmount: Number(entry?.taxAmount || 0),
      payableTotalAmount: Number(entry?.totalAmount || 0),
    };
  }

  private withDifference(line: ReconciliationLine): ReconciliationLine {
    return {
      ...line,
      differenceQty: this.round(Number(line.businessQty || 0) - Number(line.payableQty || 0), 4),
      differenceUntaxedAmount: this.round(Number(line.businessUntaxedAmount || 0) - Number(line.payableUntaxedAmount || 0), 2),
      differenceTaxAmount: this.round(Number(line.businessTaxAmount || 0) - Number(line.payableTaxAmount || 0), 2),
      differenceTotalAmount: this.round(Number(line.businessTotalAmount || 0) - Number(line.payableTotalAmount || 0), 2),
    };
  }

  private async buildLines(
    dto: GeneratePurchaseReconciliationDto,
    period: { start: Date; endExclusive: Date },
    manager: EntityManager,
  ) {
    const orderQuery = manager.getRepository(PurchaseOrder).createQueryBuilder('order')
      .leftJoinAndSelect('order.entries', 'entry', 'entry.isDeleted = 0')
      .where('order.isDeleted = 0')
      .andWhere('order.supplierId = :supplierId', { supplierId: dto.supplierId })
      .andWhere('order.purchaseOrgId = :purchaseOrgId', { purchaseOrgId: dto.purchaseOrgId });
    if (dto.purchaseOrderId) orderQuery.andWhere('order.id = :orderId', { orderId: dto.purchaseOrderId });
    const orders = await orderQuery.getMany();
    if (!orders.length) throw new BadRequestException('对账维度下不存在采购订单');
    const orderById = new Map(orders.map((order) => [order.id, order]));
    const orderEntryById = new Map<string, PurchaseOrderEntry>();
    orders.forEach((order) => (order.entries || []).forEach((entry) => orderEntryById.set(entry.id, entry)));
    const orderIds = [...orderById.keys()];
    const orderEntryIds = [...orderEntryById.keys()];

    const inboundEntries = await manager.getRepository(InventoryInEntry).createQueryBuilder('entry')
      .innerJoinAndSelect('entry.inventoryIn', 'header')
      .where('entry.isDeleted = 0').andWhere('header.isDeleted = 0').andWhere('header.status = 2')
      .andWhere('entry.sourceOrderId IN (:...orderIds)', { orderIds })
      .andWhere('header.supplierId = :supplierId', { supplierId: dto.supplierId })
      .andWhere('header.purchaseOrgId = :purchaseOrgId', { purchaseOrgId: dto.purchaseOrgId })
      .andWhere('header.settleOrgId = :settleOrgId', { settleOrgId: dto.settleOrgId })
      .andWhere('header.currencyId = :currencyId', { currencyId: dto.currencyId })
      .andWhere('header.inDate >= :start AND header.inDate < :end', { start: period.start, end: period.endExclusive })
      .getMany();

    const returnEntries = await manager.getRepository(PurchaseReturnEntry).createQueryBuilder('entry')
      .innerJoinAndSelect('entry.purchaseReturn', 'header')
      .where('entry.isDeleted = 0').andWhere('header.isDeleted = 0').andWhere('header.status = 2')
      .andWhere('entry.sourceOrderId IN (:...orderIds)', { orderIds })
      .andWhere('header.supplierId = :supplierId', { supplierId: dto.supplierId })
      .andWhere('header.purchaseOrgId = :purchaseOrgId', { purchaseOrgId: dto.purchaseOrgId })
      .andWhere('header.settleOrgId = :settleOrgId', { settleOrgId: dto.settleOrgId })
      .andWhere('header.currencyId = :currencyId', { currencyId: dto.currencyId })
      .andWhere('header.returnDate >= :start AND header.returnDate < :end', { start: period.start, end: period.endExclusive })
      .getMany();

    const payableEntries = orderEntryIds.length ? await manager.getRepository(PayableEntry).createQueryBuilder('entry')
      .innerJoinAndSelect('entry.payable', 'header')
      .where('entry.isDeleted = 0').andWhere('header.isDeleted = 0')
      .andWhere('header.payableType IN (:...types)', { types: ['ESTIMATED', 'RED'] })
      .andWhere('entry.sourceOrderEntryId IN (:...orderEntryIds)', { orderEntryIds })
      .andWhere('header.supplierId = :supplierId', { supplierId: dto.supplierId })
      .andWhere('header.settleOrgId = :settleOrgId', { settleOrgId: dto.settleOrgId })
      .andWhere('header.currencyId = :currencyId', { currencyId: dto.currencyId })
      .andWhere('header.payableDate >= :start AND header.payableDate < :end', { start: period.start, end: period.endExclusive })
      .getMany() : [];

    const payableByInbound = new Map(payableEntries.filter((entry) => entry.inventoryInEntryId).map((entry) => [entry.inventoryInEntryId, entry]));
    const payableByReturn = new Map(payableEntries.filter((entry) => entry.purchaseReturnEntryId).map((entry) => [entry.purchaseReturnEntryId, entry]));
    const matchedPayableIds = new Set<string>();
    const lines: ReconciliationLine[] = [];

    for (const entry of inboundEntries) {
      const order = orderById.get(entry.sourceOrderId);
      const payable = payableByInbound.get(entry.id);
      if (payable) matchedPayableIds.add(payable.id);
      lines.push(this.withDifference({
        businessSourceType: 'PURCHASE_INBOUND',
        businessSourceId: entry.inventoryInId,
        businessSourceNo: entry.inventoryIn.inNo,
        businessSourceEntryId: entry.id,
        businessDate: entry.inventoryIn.inDate,
        sourceOrderId: entry.sourceOrderId,
        sourceOrderNo: entry.sourceOrderNo || order?.orderNo,
        sourceOrderEntryId: entry.sourceOrderEntryId,
        sourceRequestId: entry.sourceRequestId,
        sourceRequestEntryId: entry.sourceRequestEntryId,
        expenseItemCode: null,
        expenseItemName: null,
        materialId: entry.materialId,
        materialCode: entry.materialCode,
        materialName: entry.materialName,
        materialModel: entry.materialModel,
        unitId: entry.unitId,
        unitCode: entry.unitCode,
        unitName: entry.unitName,
        warehouseId: entry.warehouseId,
        businessQty: Number(entry.quantity),
        businessUnitPrice: Number(entry.unitPrice),
        businessTaxRate: Number(entry.taxRate || 0),
        businessUntaxedAmount: Number(entry.amount || 0),
        businessTaxAmount: Number(entry.taxAmount || 0),
        businessTotalAmount: Number(entry.totalAmount || 0),
        ...this.payableValues(payable),
      }));
    }

    for (const entry of returnEntries) {
      const order = orderById.get(entry.sourceOrderId);
      const payable = payableByReturn.get(entry.id);
      if (payable) matchedPayableIds.add(payable.id);
      lines.push(this.withDifference({
        businessSourceType: 'PURCHASE_RETURN',
        businessSourceId: entry.purchaseReturnId,
        businessSourceNo: entry.purchaseReturn.returnNo,
        businessSourceEntryId: entry.id,
        businessDate: entry.purchaseReturn.returnDate,
        sourceOrderId: entry.sourceOrderId,
        sourceOrderNo: order?.orderNo,
        sourceOrderEntryId: entry.sourceOrderEntryId,
        sourceRequestId: entry.sourceRequestId,
        sourceRequestEntryId: entry.sourceRequestEntryId,
        materialId: entry.materialId,
        materialCode: entry.materialCode,
        materialName: entry.materialName,
        materialModel: entry.materialModel,
        unitId: entry.unitId,
        unitCode: entry.unitCode,
        unitName: entry.unitName,
        warehouseId: entry.warehouseId,
        businessQty: -Math.abs(Number(entry.returnQty)),
        businessUnitPrice: Number(entry.unitPrice),
        businessTaxRate: Number(entry.taxRate || 0),
        businessUntaxedAmount: -Math.abs(Number(entry.amount || 0)),
        businessTaxAmount: -Math.abs(Number(entry.taxAmount || 0)),
        businessTotalAmount: -Math.abs(Number(entry.totalAmount || 0)),
        ...this.payableValues(payable),
      }));
    }

    const unmatched = payableEntries.filter((entry) => !matchedPayableIds.has(entry.id));
    const assetIds = unmatched.map((entry) => entry.assetAcceptanceEntryId).filter(Boolean);
    const expenseIds = unmatched.map((entry) => entry.expenseAcceptanceEntryId).filter(Boolean);
    const assets = assetIds.length ? await manager.getRepository(AssetAcceptanceEntry).find({
      where: { id: In(assetIds), isDeleted: 0 }, relations: { assetAcceptance: true },
    }) : [];
    const expenses = expenseIds.length ? await manager.getRepository(ExpenseAcceptanceEntry).find({
      where: { id: In(expenseIds), isDeleted: 0 }, relations: { expenseAcceptance: true },
    }) : [];
    const assetById = new Map(assets.map((entry) => [entry.id, entry]));
    const expenseById = new Map(expenses.map((entry) => [entry.id, entry]));

    for (const payable of unmatched) {
      const orderEntry = orderEntryById.get(payable.sourceOrderEntryId);
      const order = orderEntry && orderById.get(orderEntry.purchaseOrderId);
      const asset = payable.assetAcceptanceEntryId && assetById.get(payable.assetAcceptanceEntryId);
      const expense = payable.expenseAcceptanceEntryId && expenseById.get(payable.expenseAcceptanceEntryId);
      const sourceType = asset ? 'ASSET_ACCEPTANCE' : expense ? 'EXPENSE_ACCEPTANCE' : 'PAYABLE_ONLY';
      const sourceHeader = asset?.assetAcceptance || expense?.expenseAcceptance;
      const quantity = asset ? Number(asset.passedQty) : expense ? Number(expense.acceptanceQty) : 0;
      const amount = asset ? Number(asset.amount) : expense ? Number(expense.amount) : 0;
      const taxAmount = asset ? Number(asset.taxAmount) : expense ? Number(expense.taxAmount) : 0;
      const totalAmount = asset ? Number(asset.totalAmount) : expense ? Number(expense.totalAmount) : 0;
      lines.push(this.withDifference({
        businessSourceType: sourceType,
        businessSourceId: sourceHeader?.id || payable.payableId,
        businessSourceNo: (sourceHeader as any)?.acceptanceNo || payable.payable.payableNo,
        businessSourceEntryId: asset?.id || expense?.id || payable.id,
        businessDate: (sourceHeader as any)?.acceptanceDate || payable.payable.payableDate,
        sourceOrderId: order?.id,
        sourceOrderNo: order?.orderNo,
        sourceOrderEntryId: payable.sourceOrderEntryId,
        sourceRequestId: asset?.sourceRequestId || expense?.sourceRequestId || orderEntry?.sourceRequestId,
        sourceRequestEntryId: payable.sourceRequestEntryId,
        expenseItemCode: expense?.expenseItemCode || payable.expenseItemCode,
        expenseItemName: expense?.expenseItemName || payable.expenseItemName,
        materialId: asset?.materialId || expense?.materialId || payable.materialId,
        materialCode: asset?.materialCode || expense?.materialCode || payable.materialCode,
        materialName: asset?.materialName || expense?.materialName || payable.materialName,
        materialModel: asset?.materialModel || expense?.materialModel || payable.materialModel,
        unitId: asset?.unitId || expense?.unitId || payable.unitId,
        unitCode: asset?.unitCode || expense?.unitCode || payable.unitCode,
        unitName: asset?.unitName || expense?.unitName || payable.unitName,
        warehouseId: null,
        businessQty: quantity,
        businessUnitPrice: Number(asset?.unitPrice || expense?.unitPrice || 0),
        businessTaxRate: Number(asset?.taxRate || expense?.taxRate || 0),
        businessUntaxedAmount: amount,
        businessTaxAmount: taxAmount,
        businessTotalAmount: totalAmount,
        ...this.payableValues(payable),
      }));
    }
    return lines.sort((left, right) => {
      const date = new Date(left.businessDate).getTime() - new Date(right.businessDate).getTime();
      return date || String(left.businessSourceNo).localeCompare(String(right.businessSourceNo));
    });
  }

  private applyTotals(header: PurchaseReconciliation, entries: Array<Partial<PurchaseReconciliationEntry>>) {
    const sum = (field: keyof PurchaseReconciliationEntry, digits: number) => this.round(entries.reduce((total, entry) => total + Number(entry[field] || 0), 0), digits);
    header.businessQty = sum('businessQty', 4);
    header.businessUntaxedAmount = sum('businessUntaxedAmount', 2);
    header.businessTaxAmount = sum('businessTaxAmount', 2);
    header.businessTotalAmount = sum('businessTotalAmount', 2);
    header.payableQty = sum('payableQty', 4);
    header.payableUntaxedAmount = sum('payableUntaxedAmount', 2);
    header.payableTaxAmount = sum('payableTaxAmount', 2);
    header.payableTotalAmount = sum('payableTotalAmount', 2);
    header.differenceQty = sum('differenceQty', 4);
    header.differenceUntaxedAmount = sum('differenceUntaxedAmount', 2);
    header.differenceTaxAmount = sum('differenceTaxAmount', 2);
    header.differenceTotalAmount = sum('differenceTotalAmount', 2);
  }

  async generate(dto: GeneratePurchaseReconciliationDto) {
    const period = this.normalizePeriod(dto);
    const { scopeKey, payloadHash } = this.hashes(dto);
    const existing = await this.repository.findOne({ where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 } });
    if (existing) return this.assertIdempotent(existing, payloadHash);
    const active = await this.repository.findOne({ where: { activeScopeKey: scopeKey, isDeleted: 0 }, relations: { entries: true } });
    if (active) return this.present(active);
    try {
      return await this.dataSource.transaction(async (manager) => {
        const lockOption = this.dataSource.options.type === 'sqlite' ? {} : { lock: { mode: 'pessimistic_write' as const } };
        const retry = await manager.findOne(PurchaseReconciliation, {
          where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 }, ...lockOption,
        });
        if (retry) return this.assertIdempotent(retry, payloadHash);
        const current = await manager.findOne(PurchaseReconciliation, { where: { activeScopeKey: scopeKey, isDeleted: 0 } });
        if (current) {
          const loaded = await this.findEntityById(current.id, manager);
          return this.present(loaded || current);
        }
        let order: PurchaseOrder = null;
        if (dto.purchaseOrderId) {
          order = await manager.findOne(PurchaseOrder, { where: { id: dto.purchaseOrderId, isDeleted: 0 } });
          if (!order) throw new NotFoundException('采购订单不存在');
          if (order.supplierId !== dto.supplierId || order.purchaseOrgId !== dto.purchaseOrgId || order.currencyId !== dto.currencyId) {
            throw new BadRequestException('采购订单与对账供应商、采购组织或币种不一致');
          }
        }
        const resolved = await this.buildLines(dto, period, manager);
        if (!resolved.length) throw new BadRequestException('当前维度和期间没有可生成对账单的业务数据');
        const header = manager.create(PurchaseReconciliation, {
          reconciliationNo: generateDocumentNo('PREC'),
          idempotencyKey: dto.idempotencyKey,
          payloadHash,
          scopeKey,
          activeScopeKey: scopeKey,
          supplierId: dto.supplierId,
          purchaseOrgId: dto.purchaseOrgId,
          settleOrgId: dto.settleOrgId,
          currencyId: dto.currencyId,
          periodStart: period.start,
          periodEnd: period.endInclusive,
          purchaseOrderId: order?.id || null,
          purchaseOrderNo: order?.orderNo || null,
          reconciliationDate: dto.reconciliationDate ? new Date(dto.reconciliationDate) : new Date(),
          initiator: 'PURCHASE_ORG',
          includeGeneratedPayables: true,
          status: PurchaseReconciliationStatus.GENERATED,
          remark: dto.remark || null,
        });
        this.applyTotals(header, resolved);
        const saved = await manager.save(header);
        saved.entries = await manager.save(resolved.map((line, index) => manager.create(PurchaseReconciliationEntry, {
          ...line,
          purchaseReconciliationId: saved.id,
          lineNo: index + 1,
        })));
        return this.present(saved);
      });
    } catch (error) {
      const concurrent = await this.repository.findOne({ where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 } });
      if (concurrent) return this.assertIdempotent(concurrent, payloadHash);
      const concurrentScope = await this.repository.findOne({ where: { activeScopeKey: scopeKey, isDeleted: 0 }, relations: { entries: true } });
      if (concurrentScope) return this.present(concurrentScope);
      throw error;
    }
  }

  async confirm(id: string, dto: ConfirmPurchaseReconciliationDto) {
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntityById(id, manager, true);
      if (!entity) throw new NotFoundException('采购对账单不存在');
      if (entity.status === PurchaseReconciliationStatus.CONFIRMED) return this.present(entity);
      if (entity.status !== PurchaseReconciliationStatus.GENERATED) throw new BadRequestException('只有未确认采购对账单允许确认');
      if (new Set(dto.entries.map((line) => line.entryId)).size !== dto.entries.length || dto.entries.length !== entity.entries.length) {
        throw new BadRequestException('对账确认必须完整且不重复地提交全部明细');
      }
      const inputById = new Map(dto.entries.map((line) => [line.entryId, line]));
      for (const entry of entity.entries.sort((left, right) => left.id.localeCompare(right.id))) {
        const input = inputById.get(entry.id);
        if (!input) throw new BadRequestException(`缺少对账明细第${entry.lineNo}行确认值`);
        const differenceQty = this.round(input.confirmedQty - Number(entry.payableQty || 0), 4);
        const differenceUntaxedAmount = this.round(input.confirmedUntaxedAmount - Number(entry.payableUntaxedAmount || 0), 2);
        const differenceTaxAmount = this.round(input.confirmedTaxAmount - Number(entry.payableTaxAmount || 0), 2);
        const differenceTotalAmount = this.round(input.confirmedTotalAmount - Number(entry.payableTotalAmount || 0), 2);
        if (
          (Math.abs(differenceQty) > 0.0001 || Math.abs(differenceUntaxedAmount) > 0.01 || Math.abs(differenceTaxAmount) > 0.01 || Math.abs(differenceTotalAmount) > 0.01)
          && !input.differenceReason?.trim()
        ) {
          throw new BadRequestException(`对账明细第${entry.lineNo}行存在非零差异，差异原因必填`);
        }
        entry.confirmedQty = this.round(input.confirmedQty, 4);
        entry.confirmedUnitPrice = this.round(input.confirmedUnitPrice, 4);
        entry.confirmedUntaxedAmount = this.round(input.confirmedUntaxedAmount, 2);
        entry.confirmedTaxAmount = this.round(input.confirmedTaxAmount, 2);
        entry.confirmedTotalAmount = this.round(input.confirmedTotalAmount, 2);
        entry.differenceQty = differenceQty;
        entry.differenceUntaxedAmount = differenceUntaxedAmount;
        entry.differenceTaxAmount = differenceTaxAmount;
        entry.differenceTotalAmount = differenceTotalAmount;
        entry.differenceReason = input.differenceReason?.trim() || null;
        entry.confirmRemark = input.remark || null;
      }
      await manager.save(entity.entries);
      entity.confirmedQty = this.round(entity.entries.reduce((sum, entry) => sum + Number(entry.confirmedQty || 0), 0), 4);
      entity.confirmedUntaxedAmount = this.round(entity.entries.reduce((sum, entry) => sum + Number(entry.confirmedUntaxedAmount || 0), 0), 2);
      entity.confirmedTaxAmount = this.round(entity.entries.reduce((sum, entry) => sum + Number(entry.confirmedTaxAmount || 0), 0), 2);
      entity.confirmedTotalAmount = this.round(entity.entries.reduce((sum, entry) => sum + Number(entry.confirmedTotalAmount || 0), 0), 2);
      this.applyTotals(entity, entity.entries);
      entity.status = PurchaseReconciliationStatus.CONFIRMED;
      entity.confirmedAt = new Date();
      entity.confirmedBy = dto.confirmedBy || null;
      entity.updatedBy = dto.confirmedBy || null;
      await manager.save(entity);
      return this.present(entity);
    });
  }

  async cancel(id: string, dto: CancelPurchaseReconciliationDto) {
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntityById(id, manager, true);
      if (!entity) throw new NotFoundException('采购对账单不存在');
      if (entity.status === PurchaseReconciliationStatus.CANCELED) return this.present(entity);
      if (entity.status !== PurchaseReconciliationStatus.GENERATED) throw new BadRequestException('只有未确认采购对账单允许取消');
      entity.status = PurchaseReconciliationStatus.CANCELED;
      entity.activeScopeKey = null;
      entity.canceledAt = new Date();
      entity.canceledBy = dto.canceledBy || null;
      entity.cancelReason = dto.reason;
      entity.updatedBy = dto.canceledBy || null;
      await manager.save(entity);
      return this.present(entity);
    });
  }
}
