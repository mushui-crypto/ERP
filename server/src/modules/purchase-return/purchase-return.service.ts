import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { InventoryInEntry } from '../../database/entities/inventory-in-entry.entity';
import { InventoryIn } from '../../database/entities/inventory-in.entity';
import { PurchaseOrderEntry } from '../../database/entities/purchase-order-entry.entity';
import { PurchaseReceiveNoticeEntry } from '../../database/entities/purchase-receive-notice-entry.entity';
import { PurchaseReturnRequestEntry } from '../../database/entities/purchase-return-request-entry.entity';
import { PurchaseReturnRequest } from '../../database/entities/purchase-return-request.entity';
import { PurchaseReturnEntry } from '../../database/entities/purchase-return-entry.entity';
import { PurchaseReturn } from '../../database/entities/purchase-return.entity';
import { InventoryInStatus, InventoryInType } from '../inventory-in/inventory-in.status';
import { InventoryService } from '../inventory/inventory.service';
import { PayableService } from '../payable/payable.service';
import {
  generateDocumentNo,
  PURCHASE_RETURN_STATUS_META,
  PurchaseReturnMode,
  PurchaseReturnSourceType,
  PurchaseReturnStatus,
  RedPayableGenerationStatus,
  withStatusMeta,
} from '../purchase-common/purchase-status';
import { PurchaseReceiveNoticeService } from '../purchase-receive-notice/purchase-receive-notice.service';
import {
  CreatePurchaseReturnFromInboundDto,
  CreatePurchaseReturnFromRequestDto,
  OperatePurchaseReturnDto,
  UpdatePurchaseReturnDto,
} from './dto/purchase-return.dto';

const EPSILON = 0.000001;
const ACTIVE_RETURN_STATUSES = [PurchaseReturnStatus.DRAFT, PurchaseReturnStatus.SUBMITTED];

@Injectable()
export class PurchaseReturnService {
  constructor(
    @InjectRepository(PurchaseReturn)
    private readonly returnRepository: Repository<PurchaseReturn>,
    private readonly dataSource: DataSource,
    private readonly inventoryService: InventoryService,
    private readonly payableService: PayableService,
    private readonly receiveNoticeService: PurchaseReceiveNoticeService,
  ) {}

  private round(value: number, scale: number) {
    const factor = 10 ** scale;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }

  private calculateLine(quantity: number, source: InventoryInEntry) {
    const returnQty = this.round(quantity, 4);
    const unitPrice = this.round(Number(source.unitPrice || 0), 4);
    const taxRate = this.round(Number(source.taxRate || 0), 4);
    const amount = this.round(returnQty * unitPrice, 2);
    const taxAmount = this.round((amount * taxRate) / 100, 2);
    return { returnQty, unitPrice, taxRate, amount, taxAmount, totalAmount: this.round(amount + taxAmount, 2) };
  }

  private present(header: PurchaseReturn) {
    const entries = (header.entries || [])
      .filter((entry) => entry.isDeleted === 0)
      .sort((a, b) => a.lineNo - b.lineNo)
      .map((entry) => ({
        ...entry,
        returnQty: Number(entry.returnQty || 0),
        replenishedReceivedQty: Number(entry.replenishedReceivedQty || 0),
        replenishedStockedQty: Number(entry.replenishedStockedQty || 0),
      }));
    const availableActions = header.status === PurchaseReturnStatus.DRAFT || header.status === PurchaseReturnStatus.REJECTED
      ? ['EDIT', 'SUBMIT', 'CANCEL']
      : header.status === PurchaseReturnStatus.SUBMITTED
        ? ['APPROVE', 'REJECT', 'CANCEL']
        : header.status === PurchaseReturnStatus.APPROVED && header.payableGenerationStatus === RedPayableGenerationStatus.FAILED
          ? ['RETRY_PAYABLE']
          : [];
    return { ...withStatusMeta({ ...header, entries }, PURCHASE_RETURN_STATUS_META), availableActions };
  }

  private applyTotals(header: PurchaseReturn, entries: PurchaseReturnEntry[]) {
    header.untaxedAmount = this.round(entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0), 2);
    header.taxAmount = this.round(entries.reduce((sum, entry) => sum + Number(entry.taxAmount || 0), 0), 2);
    header.totalAmount = this.round(entries.reduce((sum, entry) => sum + Number(entry.totalAmount || 0), 0), 2);
  }

  async findAll(page = 1, pageSize = 20, returnNo?: string, supplierId?: string, status?: number, payableStatus?: string) {
    const query = this.returnRepository
      .createQueryBuilder('header')
      .leftJoinAndSelect('header.entries', 'entry', 'entry.isDeleted = 0')
      .where('header.isDeleted = 0');
    if (returnNo) query.andWhere('header.returnNo LIKE :returnNo', { returnNo: `%${returnNo}%` });
    if (supplierId) query.andWhere('header.supplierId = :supplierId', { supplierId });
    if (status !== undefined) query.andWhere('header.status = :status', { status });
    if (payableStatus) query.andWhere('header.payableGenerationStatus = :payableStatus', { payableStatus });
    const [list, total] = await query
      .orderBy('header.createdAt', 'DESC')
      .addOrderBy('entry.lineNo', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { list: list.map((item) => this.present(item)), total, page, pageSize };
  }

  private findEntity(id: string, manager?: EntityManager, lock = false) {
    const repository = manager ? manager.getRepository(PurchaseReturn) : this.returnRepository;
    return repository.findOne({
      where: { id, isDeleted: 0 },
      relations: { entries: true },
      order: { entries: { lineNo: 'ASC' } },
      ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}),
    });
  }

  async findById(id: string) {
    const header = await this.findEntity(id);
    return header ? this.present(header) : null;
  }

  private async activeDirectQty(manager: EntityManager, inventoryInEntryId: string, excludeReturnId?: string) {
    const query = manager.getRepository(PurchaseReturnEntry)
      .createQueryBuilder('entry')
      .innerJoin(PurchaseReturn, 'header', 'header.id = entry.purchase_return_id')
      .select('COALESCE(SUM(entry.return_qty), 0)', 'quantity')
      .where('entry.source_inventory_in_entry_id = :inventoryInEntryId', { inventoryInEntryId })
      .andWhere('entry.source_return_request_entry_id IS NULL')
      .andWhere('entry.is_deleted = 0')
      .andWhere('header.is_deleted = 0')
      .andWhere('header.status IN (:...statuses)', { statuses: ACTIVE_RETURN_STATUSES });
    if (excludeReturnId) query.andWhere('header.id <> :excludeReturnId', { excludeReturnId });
    const row = await query.getRawOne();
    return Number(row?.quantity || 0);
  }

  private async reservedRequestQty(manager: EntityManager, inventoryInEntryId: string) {
    const row = await manager.getRepository(PurchaseReturnRequestEntry)
      .createQueryBuilder('entry')
      .innerJoin(PurchaseReturnRequest, 'header', 'header.id = entry.purchase_return_request_id')
      .select('COALESCE(SUM(entry.request_qty - entry.returned_qty), 0)', 'quantity')
      .where('entry.source_inventory_in_entry_id = :inventoryInEntryId', { inventoryInEntryId })
      .andWhere('entry.is_deleted = 0')
      .andWhere('header.is_deleted = 0')
      .andWhere('header.status = :status', { status: PurchaseReturnStatus.APPROVED })
      .getRawOne();
    return Number(row?.quantity || 0);
  }

  private async activeRequestReturnQty(manager: EntityManager, returnRequestEntryId: string, excludeReturnId?: string) {
    const query = manager.getRepository(PurchaseReturnEntry)
      .createQueryBuilder('entry')
      .innerJoin(PurchaseReturn, 'header', 'header.id = entry.purchase_return_id')
      .select('COALESCE(SUM(entry.return_qty), 0)', 'quantity')
      .where('entry.source_return_request_entry_id = :returnRequestEntryId', { returnRequestEntryId })
      .andWhere('entry.is_deleted = 0')
      .andWhere('header.is_deleted = 0')
      .andWhere('header.status IN (:...statuses)', { statuses: ACTIVE_RETURN_STATUSES });
    if (excludeReturnId) query.andWhere('header.id <> :excludeReturnId', { excludeReturnId });
    const row = await query.getRawOne();
    return Number(row?.quantity || 0);
  }

  private createHeaderFromInbound(manager: EntityManager, inbound: InventoryIn, input: {
    idempotencyKey: string; returnMode: string; returnDate?: string; reason: string; remark?: string;
  }) {
    return manager.create(PurchaseReturn, {
      returnNo: generateDocumentNo('PRT'),
      idempotencyKey: input.idempotencyKey,
      sourceType: PurchaseReturnSourceType.INVENTORY_IN,
      purchaseOrgId: inbound.purchaseOrgId || inbound.orgId,
      stockOrgId: inbound.stockOrgId || inbound.orgId,
      settleOrgId: inbound.settleOrgId,
      supplierId: inbound.supplierId,
      currencyId: inbound.currencyId,
      paymentTermId: inbound.paymentTermId,
      returnMode: input.returnMode,
      returnDate: input.returnDate ? new Date(input.returnDate) : new Date(),
      reason: input.reason.trim(),
      status: PurchaseReturnStatus.DRAFT,
      payableGenerationStatus: input.returnMode === PurchaseReturnMode.DEDUCTION
        ? RedPayableGenerationStatus.NOT_GENERATED
        : RedPayableGenerationStatus.NOT_REQUIRED,
      remark: input.remark || null,
    });
  }

  private createEntry(manager: EntityManager, headerId: string, lineNo: number, inbound: InventoryIn, source: InventoryInEntry, quantity: number, requestEntryId?: string, remark?: string) {
    return manager.create(PurchaseReturnEntry, {
      purchaseReturnId: headerId,
      lineNo,
      sourceReturnRequestEntryId: requestEntryId || null,
      sourceInventoryInId: inbound.id,
      sourceInventoryInNo: inbound.inNo,
      sourceInventoryInEntryId: source.id,
      sourceReceiveNoticeId: source.sourceReceiveNoticeId,
      sourceReceiveNoticeEntryId: source.sourceReceiveNoticeEntryId,
      sourceOrderId: source.sourceOrderId,
      sourceOrderEntryId: source.sourceOrderEntryId,
      sourceRequestId: source.sourceRequestId,
      sourceRequestEntryId: source.sourceRequestEntryId,
      materialId: source.materialId,
      materialCode: source.materialCode,
      materialName: source.materialName,
      materialModel: source.materialModel,
      unitId: source.unitId,
      unitCode: source.unitCode,
      unitName: source.unitName,
      warehouseId: source.warehouseId,
      lotNo: source.lotNo || '',
      ...this.calculateLine(quantity, source),
      replenishedReceivedQty: 0,
      replenishedStockedQty: 0,
      remark: remark || null,
    });
  }

  async createFromInbound(dto: CreatePurchaseReturnFromInboundDto) {
    const duplicate = await this.returnRepository.findOne({ where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 }, relations: { entries: true } });
    if (duplicate) return this.present(duplicate);
    if (new Set(dto.lines.map((line) => line.inventoryInEntryId)).size !== dto.lines.length) throw new BadRequestException('同一采购入库明细不能重复');
    return this.dataSource.transaction(async (manager) => {
      const inbound = await manager.findOne(InventoryIn, { where: { id: dto.inventoryInId, isDeleted: 0 }, relations: { entries: true }, lock: { mode: 'pessimistic_write' } });
      if (!inbound) throw new NotFoundException('来源采购入库单不存在');
      if (inbound.inType !== InventoryInType.PURCHASE || inbound.status !== InventoryInStatus.APPROVED) throw new BadRequestException('只有已审核采购入库单允许直接退料');
      const existingAfterSourceLock = await manager.findOne(PurchaseReturn, {
        where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 },
        relations: { entries: true },
      });
      if (existingAfterSourceLock) return this.present(existingAfterSourceLock);
      const sourceMap = new Map(inbound.entries.filter((entry) => entry.isDeleted === 0).map((entry) => [entry.id, entry]));
      const sources: InventoryInEntry[] = [];
      for (const line of dto.lines) {
        if (!sourceMap.has(line.inventoryInEntryId)) throw new BadRequestException('退料明细不属于来源采购入库单');
        const source = await manager.findOne(InventoryInEntry, { where: { id: line.inventoryInEntryId, inventoryInId: inbound.id, isDeleted: 0 }, lock: { mode: 'pessimistic_write' } });
        const active = await this.activeDirectQty(manager, source.id);
        const reserved = await this.reservedRequestQty(manager, source.id);
        const available = Number(source.quantity) - Number(source.returnedQty || 0) - active - reserved;
        if (Number(line.quantity) - available > EPSILON) throw new BadRequestException(`入库明细第${source.lineNo}行可直接退料数量为 ${Math.max(0, available)}`);
        sources.push(source);
      }
      const header = this.createHeaderFromInbound(manager, inbound, dto);
      await manager.save(header);
      await manager.save(dto.lines.map((line, index) => this.createEntry(manager, header.id, index + 1, inbound, sources[index], line.quantity, null, line.remark)));
      header.entries = await manager.find(PurchaseReturnEntry, {
        where: { purchaseReturnId: header.id, isDeleted: 0 },
        order: { lineNo: 'ASC' },
      });
      this.applyTotals(header, header.entries);
      await manager.save(header);
      return this.present((await this.findEntity(header.id, manager))!);
    });
  }

  async createFromReturnRequest(dto: CreatePurchaseReturnFromRequestDto) {
    const duplicate = await this.returnRepository.findOne({ where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 }, relations: { entries: true } });
    if (duplicate) return this.present(duplicate);
    if (new Set(dto.lines.map((line) => line.returnRequestEntryId)).size !== dto.lines.length) throw new BadRequestException('同一退料申请明细不能重复');
    return this.dataSource.transaction(async (manager) => {
      const request = await manager.findOne(PurchaseReturnRequest, { where: { id: dto.returnRequestId, isDeleted: 0 }, relations: { entries: true }, lock: { mode: 'pessimistic_write' } });
      if (!request) throw new NotFoundException('来源退料申请不存在');
      if (request.status !== PurchaseReturnStatus.APPROVED) throw new BadRequestException('只有已审核退料申请允许生成采购退料单');
      const existingAfterSourceLock = await manager.findOne(PurchaseReturn, {
        where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 },
        relations: { entries: true },
      });
      if (existingAfterSourceLock) return this.present(existingAfterSourceLock);
      const requestMap = new Map(request.entries.filter((entry) => entry.isDeleted === 0).map((entry) => [entry.id, entry]));
      const requestEntries: PurchaseReturnRequestEntry[] = [];
      const sources: InventoryInEntry[] = [];
      let inbound: InventoryIn;
      for (const line of dto.lines) {
        const requestEntry = requestMap.get(line.returnRequestEntryId);
        if (!requestEntry) throw new BadRequestException('退料明细不属于来源退料申请');
        const lockedRequestEntry = await manager.findOne(PurchaseReturnRequestEntry, { where: { id: requestEntry.id, purchaseReturnRequestId: request.id, isDeleted: 0 }, lock: { mode: 'pessimistic_write' } });
        if (!lockedRequestEntry) throw new BadRequestException('来源退料申请明细不存在');
        const active = await this.activeRequestReturnQty(manager, lockedRequestEntry.id);
        const available = Number(lockedRequestEntry.requestQty) - Number(lockedRequestEntry.returnedQty || 0) - active;
        if (Number(line.quantity) - available > EPSILON) throw new BadRequestException(`退料申请第${lockedRequestEntry.lineNo}行可下推数量为 ${Math.max(0, available)}`);
        const source = await manager.findOne(InventoryInEntry, { where: { id: lockedRequestEntry.sourceInventoryInEntryId, isDeleted: 0 }, lock: { mode: 'pessimistic_write' } });
        if (!source) throw new BadRequestException(`退料申请第${lockedRequestEntry.lineNo}行来源采购入库明细不存在`);
        const sourceInbound = await manager.findOne(InventoryIn, { where: { id: source.inventoryInId, isDeleted: 0 } });
        if (!sourceInbound) throw new BadRequestException('来源采购入库单不存在');
        if (!inbound) inbound = sourceInbound;
        if (inbound.id !== sourceInbound.id) throw new BadRequestException('一张采购退料单只能对应一张采购入库单');
        requestEntries.push(lockedRequestEntry);
        sources.push(source);
      }
      const header = this.createHeaderFromInbound(manager, inbound, {
        ...dto,
        returnMode: request.returnMode,
        reason: request.reason,
      });
      header.sourceType = PurchaseReturnSourceType.RETURN_REQUEST;
      header.sourceReturnRequestId = request.id;
      header.sourceReturnRequestNo = request.requestNo;
      await manager.save(header);
      await manager.save(dto.lines.map((line, index) => this.createEntry(manager, header.id, index + 1, inbound, sources[index], line.quantity, requestEntries[index].id, line.remark)));
      header.entries = await manager.find(PurchaseReturnEntry, {
        where: { purchaseReturnId: header.id, isDeleted: 0 },
        order: { lineNo: 'ASC' },
      });
      this.applyTotals(header, header.entries);
      await manager.save(header);
      return this.present((await this.findEntity(header.id, manager))!);
    });
  }

  async update(id: string, dto: UpdatePurchaseReturnDto) {
    return this.dataSource.transaction(async (manager) => {
      const header = await this.findEntity(id, manager, true);
      if (!header) throw new NotFoundException('采购退料单不存在');
      if (![PurchaseReturnStatus.DRAFT, PurchaseReturnStatus.REJECTED].includes(header.status)) throw new BadRequestException('只有草稿或已驳回采购退料单允许修改');
      if (dto.lines) {
        const entries = header.entries.filter((entry) => entry.isDeleted === 0);
        if (dto.lines.length !== entries.length) throw new BadRequestException('P1 不允许新增或删除采购退料来源明细');
        const entryMap = new Map(entries.map((entry) => [entry.id, entry]));
        for (const line of dto.lines) {
          const entry = entryMap.get(line.id);
          if (!entry) throw new BadRequestException('存在不属于当前采购退料单的明细');
          const source = await manager.findOne(InventoryInEntry, { where: { id: entry.sourceInventoryInEntryId, isDeleted: 0 }, lock: { mode: 'pessimistic_write' } });
          if (!source) throw new BadRequestException(`退料明细第${entry.lineNo}行来源采购入库明细不存在`);
          let available: number;
          if (entry.sourceReturnRequestEntryId) {
            const requestEntry = await manager.findOne(PurchaseReturnRequestEntry, { where: { id: entry.sourceReturnRequestEntryId, isDeleted: 0 }, lock: { mode: 'pessimistic_write' } });
            if (!requestEntry) throw new BadRequestException(`退料明细第${entry.lineNo}行来源退料申请明细不存在`);
            available = Number(requestEntry.requestQty) - Number(requestEntry.returnedQty || 0) - await this.activeRequestReturnQty(manager, requestEntry.id, header.id);
          } else {
            available = Number(source.quantity) - Number(source.returnedQty || 0) - await this.activeDirectQty(manager, source.id, header.id) - await this.reservedRequestQty(manager, source.id);
          }
          if (Number(line.quantity) - available > EPSILON) throw new BadRequestException(`退料明细第${entry.lineNo}行超过当前可退数量`);
          Object.assign(entry, this.calculateLine(line.quantity, source), { remark: line.remark ?? entry.remark });
          await manager.save(entry);
        }
        header.entries = await manager.find(PurchaseReturnEntry, {
          where: { purchaseReturnId: header.id, isDeleted: 0 },
          order: { lineNo: 'ASC' },
        });
        this.applyTotals(header, header.entries);
      }
      if (dto.reason !== undefined) header.reason = dto.reason.trim();
      if (dto.returnDate) header.returnDate = new Date(dto.returnDate);
      if (dto.remark !== undefined) header.remark = dto.remark;
      await manager.save(header);
      return this.present((await this.findEntity(header.id, manager))!);
    });
  }

  async submit(id: string) {
    return this.changeStatus(id, [PurchaseReturnStatus.DRAFT, PurchaseReturnStatus.REJECTED], PurchaseReturnStatus.SUBMITTED, '只有草稿或已驳回采购退料单允许提交');
  }

  async approve(id: string, dto: OperatePurchaseReturnDto = {}) {
    const approved = await this.dataSource.transaction(async (manager) => {
      const header = await this.findEntity(id, manager, true);
      if (!header) throw new NotFoundException('采购退料单不存在');
      if (header.status === PurchaseReturnStatus.APPROVED) return header;
      if (header.status !== PurchaseReturnStatus.SUBMITTED) throw new BadRequestException('只有待审核采购退料单允许审核');
      const entries = header.entries.filter((entry) => entry.isDeleted === 0).sort((a, b) => a.sourceInventoryInEntryId.localeCompare(b.sourceInventoryInEntryId));
      for (const entry of entries) {
        const source = await manager.findOne(InventoryInEntry, { where: { id: entry.sourceInventoryInEntryId, isDeleted: 0 }, lock: { mode: 'pessimistic_write' } });
        if (!source) throw new BadRequestException(`退料明细第${entry.lineNo}行来源采购入库明细不存在`);
        const available = Number(source.quantity) - Number(source.returnedQty || 0);
        if (Number(entry.returnQty) - available > EPSILON) throw new BadRequestException(`退料明细第${entry.lineNo}行超过来源入库可退数量 ${Math.max(0, available)}`);
        if (entry.sourceReturnRequestEntryId) {
          const requestEntry = await manager.findOne(PurchaseReturnRequestEntry, { where: { id: entry.sourceReturnRequestEntryId, isDeleted: 0 }, lock: { mode: 'pessimistic_write' } });
          if (!requestEntry) throw new BadRequestException(`退料明细第${entry.lineNo}行来源退料申请明细不存在`);
          if (Number(requestEntry.returnedQty || 0) + Number(entry.returnQty) - Number(requestEntry.requestQty) > EPSILON) throw new BadRequestException(`退料申请第${requestEntry.lineNo}行剩余数量不足`);
          requestEntry.returnedQty = this.round(Number(requestEntry.returnedQty || 0) + Number(entry.returnQty), 4);
          await manager.save(requestEntry);
        }
        const posting = await this.inventoryService.postPurchaseReturn({
          sourceId: header.id,
          sourceEntryId: entry.id,
          warehouseId: entry.warehouseId,
          materialId: entry.materialId,
          batchNo: entry.lotNo || '',
          quantity: Number(entry.returnQty),
          amount: Number(entry.amount),
        }, manager);
        entry.inventoryPostingId = posting.id;
        source.returnedQty = this.round(Number(source.returnedQty || 0) + Number(entry.returnQty), 4);
        const receiveEntry = await manager.findOne(PurchaseReceiveNoticeEntry, { where: { id: entry.sourceReceiveNoticeEntryId, isDeleted: 0 }, lock: { mode: 'pessimistic_write' } });
        if (receiveEntry) receiveEntry.returnedQty = this.round(Number(receiveEntry.returnedQty || 0) + Number(entry.returnQty), 4);
        const orderEntry = await manager.findOne(PurchaseOrderEntry, { where: { id: entry.sourceOrderEntryId, isDeleted: 0 }, lock: { mode: 'pessimistic_write' } });
        if (orderEntry) orderEntry.returnedQty = this.round(Number(orderEntry.returnedQty || 0) + Number(entry.returnQty), 4);
        await manager.save([entry, source]);
        if (receiveEntry) await manager.save(receiveEntry);
        if (orderEntry) await manager.save(orderEntry);
      }
      header.status = PurchaseReturnStatus.APPROVED;
      header.approvedAt = new Date();
      header.approvedBy = dto.operatedBy || null;
      header.entries = entries;
      await manager.save(header);
      if (header.returnMode === PurchaseReturnMode.REPLENISH) {
        await this.receiveNoticeService.createFromReturnReplenish(header.id, manager);
      }
      return header;
    });
    if (approved.returnMode === PurchaseReturnMode.DEDUCTION) return this.generateRedPayable(id, dto.operatedBy);
    return this.findById(id);
  }

  async generateRedPayable(id: string, operatedBy?: string) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const header = await this.findEntity(id, manager, true);
        if (!header) throw new NotFoundException('采购退料单不存在');
        if (header.status !== PurchaseReturnStatus.APPROVED) throw new BadRequestException('只有已审核采购退料单允许生成红字应付');
        if (header.returnMode !== PurchaseReturnMode.DEDUCTION) throw new BadRequestException('只有扣款方式采购退料单需要红字应付');
        const payable = await this.payableService.createRedPayableFromPurchaseReturn({
          purchaseReturnId: header.id,
          purchaseReturnNo: header.returnNo,
          supplierId: header.supplierId,
          currencyId: header.currencyId,
          settleOrgId: header.settleOrgId,
          paymentTermId: header.paymentTermId,
          approvedAt: header.approvedAt,
          createdBy: operatedBy || header.approvedBy,
          entries: header.entries.filter((entry) => entry.isDeleted === 0).map((entry) => ({
            purchaseReturnEntryId: entry.id,
            sourceReceiveNoticeEntryId: entry.sourceReceiveNoticeEntryId,
            sourceOrderEntryId: entry.sourceOrderEntryId,
            sourceRequestEntryId: entry.sourceRequestEntryId,
            materialId: entry.materialId,
            materialCode: entry.materialCode,
            materialName: entry.materialName,
            materialModel: entry.materialModel,
            unitId: entry.unitId,
            unitCode: entry.unitCode,
            unitName: entry.unitName,
            quantity: Number(entry.returnQty),
            unitPrice: Number(entry.unitPrice),
            taxRate: Number(entry.taxRate),
            untaxedAmount: Number(entry.amount),
            taxAmount: Number(entry.taxAmount),
            totalAmount: Number(entry.totalAmount),
          })),
        }, manager);
        header.payableGenerationStatus = RedPayableGenerationStatus.GENERATED;
        header.payableId = payable.id;
        header.payableNo = payable.payableNo;
        header.payableGenerationError = null;
        header.payableGenerationFailedAt = null;
        header.payableGeneratedAt = new Date();
        await manager.save(header);
        return this.present(header);
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : '红字应付生成失败';
      await this.dataSource.transaction(async (manager) => {
        const header = await this.findEntity(id, manager, true);
        if (!header || header.payableGenerationStatus === RedPayableGenerationStatus.GENERATED) return;
        header.payableGenerationStatus = RedPayableGenerationStatus.FAILED;
        header.payableGenerationError = message.slice(0, 1000);
        header.payableGenerationFailedAt = new Date();
        await manager.save(header);
      });
      return this.findById(id);
    }
  }

  async reject(id: string) { return this.changeStatus(id, [PurchaseReturnStatus.SUBMITTED], PurchaseReturnStatus.REJECTED, '只有待审核采购退料单允许驳回'); }
  async cancel(id: string) { return this.changeStatus(id, [PurchaseReturnStatus.DRAFT, PurchaseReturnStatus.SUBMITTED], PurchaseReturnStatus.CANCELED, '只有草稿或待审核采购退料单允许取消'); }

  private async changeStatus(id: string, from: PurchaseReturnStatus[], to: PurchaseReturnStatus, message: string) {
    return this.dataSource.transaction(async (manager) => {
      const header = await this.findEntity(id, manager, true);
      if (!header) throw new NotFoundException('采购退料单不存在');
      if (!from.includes(header.status)) throw new BadRequestException(message);
      header.status = to;
      await manager.save(header);
      return this.present(header);
    });
  }
}
