import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { InventoryInEntry } from '../../database/entities/inventory-in-entry.entity';
import { InventoryIn } from '../../database/entities/inventory-in.entity';
import { PurchaseReturnRequestEntry } from '../../database/entities/purchase-return-request-entry.entity';
import { PurchaseReturnRequest } from '../../database/entities/purchase-return-request.entity';
import { PurchaseReturnEntry } from '../../database/entities/purchase-return-entry.entity';
import { PurchaseReturn } from '../../database/entities/purchase-return.entity';
import { InventoryInStatus, InventoryInType } from '../inventory-in/inventory-in.status';
import {
  generateDocumentNo,
  PURCHASE_RETURN_STATUS_META,
  PurchaseReturnStatus,
  withStatusMeta,
} from '../purchase-common/purchase-status';
import {
  CreatePurchaseReturnRequestFromInboundDto,
  OperatePurchaseReturnRequestDto,
  UpdatePurchaseReturnRequestDto,
} from './dto/purchase-return-request.dto';

const EPSILON = 0.000001;
const OCCUPY_REQUEST_STATUSES = [
  PurchaseReturnStatus.APPROVED,
];
const OCCUPY_RETURN_STATUSES = [PurchaseReturnStatus.DRAFT, PurchaseReturnStatus.SUBMITTED];

@Injectable()
export class PurchaseReturnRequestService {
  constructor(
    @InjectRepository(PurchaseReturnRequest)
    private readonly requestRepository: Repository<PurchaseReturnRequest>,
    private readonly dataSource: DataSource,
  ) {}

  private round(value: number, scale: number) {
    const factor = 10 ** scale;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }

  private calculateLine(quantity: number, source: InventoryInEntry) {
    const requestQty = this.round(quantity, 4);
    const unitPrice = this.round(Number(source.unitPrice || 0), 4);
    const taxRate = this.round(Number(source.taxRate || 0), 4);
    const amount = this.round(requestQty * unitPrice, 2);
    const taxAmount = this.round((amount * taxRate) / 100, 2);
    return { requestQty, unitPrice, taxRate, amount, taxAmount, totalAmount: this.round(amount + taxAmount, 2) };
  }

  private calculatePayloadHash(dto: CreatePurchaseReturnRequestFromInboundDto) {
    const payload = {
      inventoryInId: dto.inventoryInId,
      returnMode: dto.returnMode,
      reason: dto.reason.trim(),
      requestDate: dto.requestDate ? new Date(dto.requestDate).toISOString() : null,
      remark: dto.remark || null,
      lines: dto.lines.map((line) => ({
        inventoryInEntryId: line.inventoryInEntryId,
        quantity: this.round(line.quantity, 4),
        remark: line.remark || null,
      })),
    };
    return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
  }

  private assertIdempotentPayload(
    existing: PurchaseReturnRequest,
    dto: CreatePurchaseReturnRequestFromInboundDto,
    payloadHash: string,
  ) {
    if (existing.payloadHash) {
      if (existing.payloadHash !== payloadHash) {
        throw new BadRequestException('幂等键已用于不同的退料申请请求载荷');
      }
      return this.present(existing);
    }

    const entries = (existing.entries || []).filter((entry) => entry.isDeleted === 0).sort((a, b) => a.lineNo - b.lineNo);
    const sameHeader = entries.every((entry) => entry.sourceInventoryInId === dto.inventoryInId)
      && existing.returnMode === dto.returnMode
      && existing.reason === dto.reason.trim()
      && (existing.remark || null) === (dto.remark || null)
      && (!dto.requestDate || new Date(existing.requestDate).getTime() === new Date(dto.requestDate).getTime());
    const sameLines = entries.length === dto.lines.length && entries.every((entry, index) => {
      const line = dto.lines[index];
      return entry.sourceInventoryInEntryId === line.inventoryInEntryId
        && Math.abs(Number(entry.requestQty) - this.round(line.quantity, 4)) <= EPSILON
        && (entry.remark || null) === (line.remark || null);
    });
    if (!sameHeader || !sameLines) {
      throw new BadRequestException('幂等键已用于不同的退料申请请求载荷');
    }
    return this.present(existing);
  }

  private present(request: PurchaseReturnRequest) {
    const entries = (request.entries || [])
      .filter((entry) => entry.isDeleted === 0)
      .sort((a, b) => a.lineNo - b.lineNo)
      .map((entry) => ({
        ...entry,
        requestQty: Number(entry.requestQty || 0),
        returnedQty: Number(entry.returnedQty || 0),
        availableReturnQty: Math.max(0, Number(entry.requestQty || 0) - Number(entry.returnedQty || 0)),
      }));
    return withStatusMeta({ ...request, entries }, PURCHASE_RETURN_STATUS_META);
  }

  async findAll(page = 1, pageSize = 20, requestNo?: string, supplierId?: string, status?: number) {
    const query = this.requestRepository
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.entries', 'entry', 'entry.isDeleted = 0')
      .where('request.isDeleted = 0');
    if (requestNo) query.andWhere('request.requestNo LIKE :requestNo', { requestNo: `%${requestNo}%` });
    if (supplierId) query.andWhere('request.supplierId = :supplierId', { supplierId });
    if (status !== undefined) query.andWhere('request.status = :status', { status });
    const [list, total] = await query
      .orderBy('request.createdAt', 'DESC')
      .addOrderBy('entry.lineNo', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { list: list.map((item) => this.present(item)), total, page, pageSize };
  }

  private findEntity(id: string, manager?: EntityManager, lock = false) {
    const repository = manager ? manager.getRepository(PurchaseReturnRequest) : this.requestRepository;
    return repository.findOne({
      where: { id, isDeleted: 0 },
      relations: { entries: true },
      order: { entries: { lineNo: 'ASC' } },
      ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}),
    });
  }

  async findById(id: string) {
    const request = await this.findEntity(id);
    return request ? this.present(request) : null;
  }

  private async getOccupiedQty(
    manager: EntityManager,
    inventoryInEntryId: string,
    excludeRequestId?: string,
  ) {
    const requestQuery = manager
      .getRepository(PurchaseReturnRequestEntry)
      .createQueryBuilder('entry')
      .innerJoin(PurchaseReturnRequest, 'header', 'header.id = entry.purchase_return_request_id')
      .select('COALESCE(SUM(entry.request_qty - entry.returned_qty), 0)', 'quantity')
      .where('entry.source_inventory_in_entry_id = :inventoryInEntryId', { inventoryInEntryId })
      .andWhere('entry.is_deleted = 0')
      .andWhere('header.is_deleted = 0')
      .andWhere('header.status IN (:...statuses)', { statuses: OCCUPY_REQUEST_STATUSES });
    if (excludeRequestId) requestQuery.andWhere('header.id <> :excludeRequestId', { excludeRequestId });
    const requestRow = await requestQuery.getRawOne();

    const returnRow = await manager
      .getRepository(PurchaseReturnEntry)
      .createQueryBuilder('entry')
      .innerJoin(PurchaseReturn, 'header', 'header.id = entry.purchase_return_id')
      .select('COALESCE(SUM(entry.return_qty), 0)', 'quantity')
      .where('entry.source_inventory_in_entry_id = :inventoryInEntryId', { inventoryInEntryId })
      .andWhere('entry.source_return_request_entry_id IS NULL')
      .andWhere('entry.is_deleted = 0')
      .andWhere('header.is_deleted = 0')
      .andWhere('header.status IN (:...statuses)', { statuses: OCCUPY_RETURN_STATUSES })
      .getRawOne();
    return Number(requestRow?.quantity || 0) + Number(returnRow?.quantity || 0);
  }

  async createFromInbound(dto: CreatePurchaseReturnRequestFromInboundDto) {
    const payloadHash = this.calculatePayloadHash(dto);
    const duplicate = await this.requestRepository.findOne({
      where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 },
      relations: { entries: true },
    });
    if (duplicate) return this.assertIdempotentPayload(duplicate, dto, payloadHash);

    if (new Set(dto.lines.map((line) => line.inventoryInEntryId)).size !== dto.lines.length) {
      throw new BadRequestException('同一采购入库明细不能重复');
    }
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(PurchaseReturnRequest, {
        where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 },
        relations: { entries: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (existing) return this.assertIdempotentPayload(existing, dto, payloadHash);

      const inbound = await manager.findOne(InventoryIn, {
        where: { id: dto.inventoryInId, isDeleted: 0 },
        relations: { entries: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!inbound) throw new NotFoundException('来源采购入库单不存在');
      if (inbound.inType !== InventoryInType.PURCHASE || inbound.status !== InventoryInStatus.APPROVED) {
        throw new BadRequestException('只有已审核采购入库单允许生成退料申请');
      }
      const existingAfterSourceLock = await manager.findOne(PurchaseReturnRequest, {
        where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 },
        relations: { entries: true },
      });
      if (existingAfterSourceLock) return this.assertIdempotentPayload(existingAfterSourceLock, dto, payloadHash);
      const sourceById = new Map(inbound.entries.filter((entry) => entry.isDeleted === 0).map((entry) => [entry.id, entry]));
      const lockedSources: InventoryInEntry[] = [];
      for (const line of dto.lines) {
        if (!sourceById.has(line.inventoryInEntryId)) throw new BadRequestException('退料申请明细不属于来源采购入库单');
        const source = await manager.findOne(InventoryInEntry, {
          where: { id: line.inventoryInEntryId, inventoryInId: inbound.id, isDeleted: 0 },
          lock: { mode: 'pessimistic_write' },
        });
        const occupied = await this.getOccupiedQty(manager, source.id);
        const available = Number(source.quantity) - Number(source.returnedQty || 0) - occupied;
        if (Number(line.quantity) - available > EPSILON) {
          throw new BadRequestException(`入库明细第${source.lineNo}行可申请退料数量为 ${Math.max(0, available)}`);
        }
        lockedSources.push(source);
      }

      const request = manager.create(PurchaseReturnRequest, {
        requestNo: generateDocumentNo('PRR'),
        idempotencyKey: dto.idempotencyKey,
        payloadHash,
        purchaseOrgId: inbound.purchaseOrgId || inbound.orgId,
        stockOrgId: inbound.stockOrgId || inbound.orgId,
        settleOrgId: inbound.settleOrgId,
        supplierId: inbound.supplierId,
        currencyId: inbound.currencyId,
        returnMode: dto.returnMode,
        requestDate: dto.requestDate ? new Date(dto.requestDate) : new Date(),
        reason: dto.reason.trim(),
        status: PurchaseReturnStatus.DRAFT,
        remark: dto.remark || null,
      });
      await manager.save(request);
      request.entries = await manager.save(
        dto.lines.map((line, index) => {
          const source = lockedSources[index];
          const money = this.calculateLine(line.quantity, source);
          return manager.create(PurchaseReturnRequestEntry, {
            purchaseReturnRequestId: request.id,
            lineNo: index + 1,
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
            ...money,
            returnedQty: 0,
            remark: line.remark || null,
          });
        }),
      );
      return this.present((await this.findEntity(request.id, manager))!);
    });
  }

  async update(id: string, dto: UpdatePurchaseReturnRequestDto) {
    return this.dataSource.transaction(async (manager) => {
      const request = await this.findEntity(id, manager, true);
      if (!request) throw new NotFoundException('退料申请不存在');
      if (![PurchaseReturnStatus.DRAFT, PurchaseReturnStatus.REJECTED].includes(request.status)) {
        throw new BadRequestException('只有草稿或已驳回退料申请允许修改');
      }
      if (dto.lines) {
        if (dto.lines.length !== request.entries.filter((entry) => entry.isDeleted === 0).length) {
          throw new BadRequestException('P1 不允许新增或删除退料申请来源明细');
        }
        const entryById = new Map(request.entries.map((entry) => [entry.id, entry]));
        for (const line of dto.lines) {
          const entry = entryById.get(line.id);
          if (!entry) throw new BadRequestException('存在不属于当前退料申请的明细');
          const source = await manager.findOne(InventoryInEntry, {
            where: { id: entry.sourceInventoryInEntryId, isDeleted: 0 },
            lock: { mode: 'pessimistic_write' },
          });
          if (!source) throw new BadRequestException(`退料申请第${entry.lineNo}行来源采购入库明细不存在`);
          const occupied = await this.getOccupiedQty(manager, source.id, request.id);
          const available = Number(source.quantity) - Number(source.returnedQty || 0) - occupied;
          if (Number(line.quantity) - available > EPSILON) {
            throw new BadRequestException(`入库明细可申请退料数量为 ${Math.max(0, available)}`);
          }
          Object.assign(entry, this.calculateLine(line.quantity, source), { remark: line.remark ?? entry.remark });
          await manager.save(entry);
        }
      }
      if (dto.returnMode !== undefined) request.returnMode = dto.returnMode;
      if (dto.reason !== undefined) request.reason = dto.reason.trim();
      if (dto.requestDate) request.requestDate = new Date(dto.requestDate);
      if (dto.remark !== undefined) request.remark = dto.remark;
      await manager.save(request);
      return this.present((await this.findEntity(request.id, manager))!);
    });
  }

  async submit(id: string) {
    return this.changeStatus(id, [PurchaseReturnStatus.DRAFT, PurchaseReturnStatus.REJECTED], PurchaseReturnStatus.SUBMITTED, '只有草稿或已驳回退料申请允许提交');
  }

  async approve(id: string, dto: OperatePurchaseReturnRequestDto = {}) {
    return this.dataSource.transaction(async (manager) => {
      const request = await this.findEntity(id, manager, true);
      if (!request) throw new NotFoundException('退料申请不存在');
      if (request.status === PurchaseReturnStatus.APPROVED) return this.present(request);
      if (request.status !== PurchaseReturnStatus.SUBMITTED) throw new BadRequestException('只有待审核退料申请允许审核');
      for (const entry of request.entries.filter((item) => item.isDeleted === 0)) {
        const source = await manager.findOne(InventoryInEntry, { where: { id: entry.sourceInventoryInEntryId, isDeleted: 0 }, lock: { mode: 'pessimistic_write' } });
        if (!source) throw new BadRequestException(`退料申请第${entry.lineNo}行来源采购入库明细不存在`);
        const occupied = await this.getOccupiedQty(manager, source.id, request.id);
        const available = Number(source.quantity) - Number(source.returnedQty || 0) - occupied;
        if (Number(entry.requestQty) - available > EPSILON) throw new BadRequestException(`退料申请第${entry.lineNo}行超过当前可退数量`);
      }
      request.status = PurchaseReturnStatus.APPROVED;
      request.approvedAt = new Date();
      request.approvedBy = dto.operatedBy || null;
      await manager.save(request);
      return this.present(request);
    });
  }

  async reject(id: string) {
    return this.changeStatus(id, [PurchaseReturnStatus.SUBMITTED], PurchaseReturnStatus.REJECTED, '只有待审核退料申请允许驳回');
  }

  async cancel(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const request = await this.findEntity(id, manager, true);
      if (!request) throw new NotFoundException('退料申请不存在');
      if (![PurchaseReturnStatus.DRAFT, PurchaseReturnStatus.SUBMITTED, PurchaseReturnStatus.APPROVED].includes(request.status)) {
        throw new BadRequestException('当前状态不允许取消退料申请');
      }
      const hasDownstream = await manager.exists(PurchaseReturnEntry, {
        where: { sourceReturnRequestEntryId: In(request.entries.map((entry) => entry.id)), isDeleted: 0 },
      });
      if (hasDownstream) throw new BadRequestException('退料申请已有下游退料单，不允许取消');
      request.status = PurchaseReturnStatus.CANCELED;
      await manager.save(request);
      return this.present(request);
    });
  }

  private async changeStatus(id: string, from: PurchaseReturnStatus[], to: PurchaseReturnStatus, message: string) {
    return this.dataSource.transaction(async (manager) => {
      const request = await this.findEntity(id, manager, true);
      if (!request) throw new NotFoundException('退料申请不存在');
      if (!from.includes(request.status)) throw new BadRequestException(message);
      request.status = to;
      await manager.save(request);
      return this.present(request);
    });
  }
}
