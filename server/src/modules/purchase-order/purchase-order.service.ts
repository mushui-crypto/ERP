import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, Not, Repository } from 'typeorm';
import { PurchaseOrderEntry } from '../../database/entities/purchase-order-entry.entity';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';
import { PurchaseReceiveNotice } from '../../database/entities/purchase-receive-notice.entity';
import { PurchaseRequestEntry } from '../../database/entities/purchase-request-entry.entity';
import { PurchaseRequest } from '../../database/entities/purchase-request.entity';
import {
  PURCHASE_ORDER_STATUS_META,
  PurchaseOrderSourceType,
  PurchaseOrderStatus,
  PurchaseReceiveNoticeStatus,
  PurchaseRequestStatus,
  PurchaseBillType,
  PurchaseBusinessType,
  generateDocumentNo,
  withStatusMeta,
} from '../purchase-common/purchase-status';
import {
  CreatePurchaseOrderDto,
  PurchaseOrderEntryDto,
  PushPurchaseRequestToOrderDto,
  PushRequestLineDto,
  UpdatePurchaseOrderDto,
} from './dto/purchase-order.dto';

export interface ApprovedPurchaseOrderChangeLine {
  sourceOrderEntryId: string;
  sourceRequestEntryId?: string;
  oldOrderQty: number;
  newOrderQty: number;
  oldUnitPrice: number;
  newUnitPrice: number;
  oldDeliveryDate?: Date;
  newDeliveryDate?: Date;
  oldWarehouseId?: string;
  newWarehouseId?: string;
  oldRemark?: string;
  newRemark?: string;
}

@Injectable()
export class PurchaseOrderService {
  constructor(
    @InjectRepository(PurchaseOrder)
    private readonly orderRepository: Repository<PurchaseOrder>,
    @InjectRepository(PurchaseOrderEntry)
    private readonly orderEntryRepository: Repository<PurchaseOrderEntry>,
    @InjectRepository(PurchaseRequest)
    private readonly requestRepository: Repository<PurchaseRequest>,
    @InjectRepository(PurchaseRequestEntry)
    private readonly requestEntryRepository: Repository<PurchaseRequestEntry>,
    private readonly dataSource: DataSource,
  ) {}

  private present(order: PurchaseOrder) {
    const entries = (order.entries || []).map((entry) => ({
      ...entry,
      orderQty: Number(entry.orderQty),
      receivedQty: Number(entry.receivedQty || 0),
      stockedQty: Number(entry.stockedQty || 0),
      remainingReceiveQty: Math.max(0, Number(entry.orderQty) - Number(entry.receivedQty || 0)),
      remainingStockQty: Math.max(0, Number(entry.orderQty) - Number(entry.stockedQty || 0)),
      receivedNotStockedQty: Math.max(0, Number(entry.receivedQty || 0) - Number(entry.stockedQty || 0)),
    }));
    return withStatusMeta({ ...order, entries }, PURCHASE_ORDER_STATUS_META);
  }

  async findAll(page = 1, pageSize = 20, orderNo?: string, supplierId?: string, status?: number) {
    const query = this.orderRepository
      .createQueryBuilder('po')
      .leftJoinAndSelect('po.entries', 'entry', 'entry.isDeleted = 0')
      .where('po.isDeleted = 0');
    if (orderNo) query.andWhere('po.orderNo LIKE :orderNo', { orderNo: `%${orderNo}%` });
    if (supplierId) query.andWhere('po.supplierId = :supplierId', { supplierId });
    if (status !== undefined) query.andWhere('po.status = :status', { status });
    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('po.createdAt', 'DESC')
      .addOrderBy('entry.lineNo', 'ASC')
      .getManyAndCount();
    return {
      list: list.map((item) => this.present(item)),
      total,
      page,
      pageSize,
    };
  }

  async findEntityById(id: string, manager?: EntityManager, lock = false) {
    const repository = manager ? manager.getRepository(PurchaseOrder) : this.orderRepository;
    return repository.findOne({
      where: { id, isDeleted: 0 },
      relations: { entries: true },
      order: { entries: { lineNo: 'ASC' } },
      ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}),
    });
  }

  async findById(id: string) {
    const order = await this.findEntityById(id);
    return order ? this.present(order) : null;
  }

  async findByStatus(status: number, page = 1, pageSize = 20) {
    return this.findAll(page, pageSize, undefined, undefined, status);
  }

  async findByRequestId(requestId: string) {
    const ids = await this.orderEntryRepository
      .createQueryBuilder('entry')
      .select('DISTINCT entry.purchaseOrderId', 'id')
      .where('entry.sourceRequestId = :requestId', { requestId })
      .andWhere('entry.isDeleted = 0')
      .getRawMany();
    if (!ids.length) return [];
    const orders = await this.orderRepository.find({
      where: { id: In(ids.map((item) => item.id)), isDeleted: 0 },
      relations: { entries: true },
      order: { createdAt: 'DESC' },
    });
    return orders.map((item) => this.present(item));
  }

  private calculateLine(item: PurchaseOrderEntryDto | PushRequestLineDto) {
    const qty = 'orderQty' in item ? Number(item.orderQty) : Number(item.quantity);
    const unitPrice = Number(item.unitPrice || 0);
    const taxRate = Number(item.taxRate || 0);
    const amount = Number((qty * unitPrice).toFixed(2));
    const taxAmount = Number(((amount * taxRate) / 100).toFixed(2));
    return {
      qty,
      unitPrice,
      taxRate,
      amount,
      taxAmount,
      netAmount: amount + taxAmount,
    };
  }

  async create(dto: CreatePurchaseOrderDto) {
    dto.entries.forEach((entry, index) => {
      if (!entry.materialId || !entry.materialCode || !entry.materialName || !entry.unitId) {
        throw new BadRequestException(`手工标准采购订单明细第${index + 1}行物料和单位不能为空`);
      }
    });
    return this.dataSource.transaction(async (manager) => {
      const first = dto.entries[0];
      const order = manager.create(PurchaseOrder, {
        orderNo: generateDocumentNo('PO'),
        billType: PurchaseBillType.STANDARD_PURCHASE,
        businessType: PurchaseBusinessType.STANDARD,
        supplierId: dto.supplierId,
        purchaseOrgId: dto.purchaseOrgId,
        sourceType: PurchaseOrderSourceType.MANUAL,
        contractNo: dto.contractNo,
        orderDate: dto.orderDate ? new Date(dto.orderDate) : new Date(),
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : null,
        warehouseId: dto.warehouseId,
        currencyId: dto.currencyId,
        paymentTermId: dto.paymentTermId,
        buyerId: dto.buyerId,
        remark: dto.remark,
        status: PurchaseOrderStatus.DRAFT,
        materialId: first.materialId,
        materialCode: first.materialCode,
        materialName: first.materialName,
        quantity: first.orderQty,
        unitPrice: first.unitPrice || 0,
        totalAmount: 0,
        totalTax: 0,
        totalNetAmount: 0,
      });
      const saved = await manager.save(order);
      saved.entries = await manager.save(
        dto.entries.map((item, index) => {
          const money = this.calculateLine(item);
          return manager.create(PurchaseOrderEntry, {
            ...item,
            purchaseOrderId: saved.id,
            lineNo: index + 1,
            supplierId: dto.supplierId,
            orderQty: money.qty,
            receivedQty: 0,
            stockedQty: 0,
            unitPrice: money.unitPrice,
            taxRate: money.taxRate,
            amount: money.amount,
            taxAmount: money.taxAmount,
            netAmount: money.netAmount,
            deliveryDate: item.deliveryDate ? new Date(item.deliveryDate) : order.deliveryDate || null,
            warehouseId: item.warehouseId || order.warehouseId,
            checkIncoming: item.checkIncoming ?? true,
          });
        }),
      );
      this.recalculateTotals(saved);
      await manager.save(saved);
      return this.present(saved);
    });
  }

  private normalizeHashNumber(value: number | string | null | undefined, scale: number) {
    return Number(value || 0).toFixed(scale);
  }

  private normalizeHashDate(value?: string | Date | null) {
    return value ? new Date(value).toISOString() : null;
  }

  private buildPushPayloadHash(
    dto: PushPurchaseRequestToOrderDto,
    lines: Array<{
      requestEntryId: string;
      quantity: number;
      unitPrice: number;
      taxRate: number;
      deliveryDate: string | Date | null;
      warehouseId: string | null;
      checkIncoming: boolean;
      remark: string | null;
    }>,
  ) {
    const normalized = {
      supplierId: dto.supplierId.trim(),
      contractNo: dto.contractNo.trim(),
      orderDate: this.normalizeHashDate(dto.orderDate),
      currencyId: dto.currencyId?.trim() || null,
      paymentTermId: dto.paymentTermId?.trim() || null,
      buyerId: dto.buyerId?.trim() || null,
      remark: dto.remark ?? null,
      lines: lines
        .map((line) => ({
          requestEntryId: line.requestEntryId,
          quantity: this.normalizeHashNumber(line.quantity, 4),
          unitPrice: this.normalizeHashNumber(line.unitPrice, 4),
          taxRate: this.normalizeHashNumber(line.taxRate, 4),
          deliveryDate: this.normalizeHashDate(line.deliveryDate),
          warehouseId: line.warehouseId || null,
          checkIncoming: Boolean(line.checkIncoming),
          remark: line.remark ?? null,
        }))
        .sort((left, right) => left.requestEntryId.localeCompare(right.requestEntryId)),
    };
    return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
  }

  private calculateResolvedPushPayloadHash(
    dto: PushPurchaseRequestToOrderDto,
    resolved: Array<{
      requestEntry: PurchaseRequestEntry;
      line: PushRequestLineDto;
    }>,
  ) {
    return this.buildPushPayloadHash(
      dto,
      resolved.map(({ requestEntry, line }) => ({
        requestEntryId: requestEntry.id,
        quantity: Number(line.quantity),
        unitPrice: line.unitPrice === undefined ? Number(requestEntry.estimatedPrice || 0) : Number(line.unitPrice),
        taxRate: Number(line.taxRate || 0),
        deliveryDate: line.deliveryDate || requestEntry.requiredDate || null,
        warehouseId: line.warehouseId || requestEntry.warehouseId || null,
        checkIncoming: line.checkIncoming ?? true,
        remark: line.remark ?? null,
      })),
    );
  }

  private calculateExistingRetryPayloadHash(existing: PurchaseOrder, dto: PushPurchaseRequestToOrderDto) {
    const entries = (existing.entries || []).filter((entry) => entry.isDeleted === 0);
    if (!entries.length) throw new BadRequestException('幂等键对应采购订单缺少有效明细');

    const requestedByEntryId = new Map((dto.lines || []).map((line) => [line.requestEntryId, line]));
    if (dto.lines?.length) {
      const existingIds = entries.map((entry) => entry.sourceRequestEntryId).sort();
      const requestedIds = dto.lines.map((line) => line.requestEntryId).sort();
      if (JSON.stringify(existingIds) !== JSON.stringify(requestedIds)) {
        throw new BadRequestException('幂等键已被不同请求载荷使用');
      }
    } else if (dto.requestIds?.length) {
      const requestIds = new Set(dto.requestIds);
      if (entries.some((entry) => !entry.sourceRequestId || !requestIds.has(entry.sourceRequestId))) {
        throw new BadRequestException('幂等键已被不同请求载荷使用');
      }
    }

    return this.buildPushPayloadHash(
      dto,
      entries.map((entry) => {
        const requested = requestedByEntryId.get(entry.sourceRequestEntryId);
        return {
          requestEntryId: entry.sourceRequestEntryId,
          quantity: requested ? Number(requested.quantity) : Number(entry.orderQty),
          unitPrice: requested?.unitPrice === undefined ? Number(entry.unitPrice || 0) : Number(requested.unitPrice),
          taxRate: requested?.taxRate === undefined ? Number(entry.taxRate || 0) : Number(requested.taxRate),
          deliveryDate: requested?.deliveryDate || entry.deliveryDate || null,
          warehouseId: requested?.warehouseId || entry.warehouseId || null,
          checkIncoming: requested?.checkIncoming ?? entry.checkIncoming,
          remark: requested?.remark ?? entry.remark ?? null,
        };
      }),
    );
  }

  private assertIdempotentPush(existing: PurchaseOrder, dto: PushPurchaseRequestToOrderDto, payloadHash?: string) {
    const effectiveHash = payloadHash || this.calculateExistingRetryPayloadHash(existing, dto);
    if (existing.pushPayloadHash !== effectiveHash) {
      throw new BadRequestException('幂等键已被不同请求载荷使用');
    }
    existing.entries = (existing.entries || []).filter((entry) => entry.isDeleted === 0);
    return this.present(existing);
  }

  private isPushIdempotencyUniqueViolation(error: unknown) {
    const source = error as {
      driverError?: { number?: number; message?: string };
      message?: string;
    };
    const message = `${source?.driverError?.message || ''} ${source?.message || ''}`;
    return (
      [2601, 2627].includes(Number(source?.driverError?.number)) &&
      (message.includes('UQ_biz_purchase_order_push_idempotency_key') || message.includes('push_idempotency_key'))
    );
  }

  private async findByPushIdempotencyKey(idempotencyKey: string, manager?: EntityManager, lock = false) {
    const repository = manager ? manager.getRepository(PurchaseOrder) : this.orderRepository;
    return repository.findOne({
      where: { pushIdempotencyKey: idempotencyKey, isDeleted: 0 },
      relations: { entries: true },
      ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}),
    });
  }

  async createFromRequest(dto: PushPurchaseRequestToOrderDto) {
    const existing = await this.findByPushIdempotencyKey(dto.idempotencyKey);
    if (existing) return this.assertIdempotentPush(existing, dto);

    try {
      return await this.dataSource.transaction(async (manager) => {
        const concurrentExisting = await this.findByPushIdempotencyKey(dto.idempotencyKey, manager, true);
        if (concurrentExisting) return this.assertIdempotentPush(concurrentExisting, dto);

        let lines = dto.lines || [];
        if (!lines.length && dto.requestIds?.length) {
          const requestIds = [...new Set(dto.requestIds)].sort();
          const requestEntries = await manager.find(PurchaseRequestEntry, {
            where: { purchaseRequestId: In(requestIds), isDeleted: 0 },
            relations: { purchaseRequest: true },
            order: { purchaseRequestId: 'ASC', lineNo: 'ASC' },
          });
          lines = requestEntries
            .filter((entry) => entry.purchaseRequest?.status === PurchaseRequestStatus.APPROVED)
            .map((entry) => ({
              requestEntryId: entry.id,
              quantity: Math.max(0, Number(entry.approveQty ?? entry.requestQty) - Number(entry.purchasedQty || 0)),
              unitPrice: Number(entry.estimatedPrice || 0),
              deliveryDate: entry.requiredDate?.toISOString(),
              warehouseId: entry.warehouseId,
            }))
            .filter((line) => line.quantity > 0);
        }
        if (!lines.length) throw new BadRequestException('没有可下推的采购申请明细');
        const duplicates = new Set<string>();
        for (const line of lines) {
          if (duplicates.has(line.requestEntryId)) throw new BadRequestException('同一次下推不能重复选择同一申请明细');
          duplicates.add(line.requestEntryId);
        }

        const resolved: Array<{
          requestEntry: PurchaseRequestEntry;
          line: PushRequestLineDto;
        }> = [];
        for (const line of [...lines].sort((left, right) => left.requestEntryId.localeCompare(right.requestEntryId))) {
          const requestEntry = await manager.findOne(PurchaseRequestEntry, {
            where: { id: line.requestEntryId, isDeleted: 0 },
            relations: { purchaseRequest: true },
            lock: { mode: 'pessimistic_write' },
          });
          if (!requestEntry || !requestEntry.purchaseRequest)
            throw new NotFoundException(`采购申请明细不存在: ${line.requestEntryId}`);
          if (requestEntry.purchaseRequest.status !== PurchaseRequestStatus.APPROVED) {
            throw new BadRequestException(`采购申请${requestEntry.purchaseRequest.requestNo}不是可下推的已批准状态`);
          }
          if (!requestEntry.purchaseOrgId) {
            throw new BadRequestException(
              `采购申请${requestEntry.purchaseRequest.requestNo}第${requestEntry.lineNo}行缺少采购组织`,
            );
          }
          const approveQty = Number(requestEntry.approveQty ?? requestEntry.requestQty);
          const remaining = approveQty - Number(requestEntry.purchasedQty || 0);
          if (Number(line.quantity) > remaining + 0.000001) {
            throw new BadRequestException(
              `采购申请${requestEntry.purchaseRequest.requestNo}第${requestEntry.lineNo}行下推数量超过剩余批准数量${remaining}`,
            );
          }
          resolved.push({ requestEntry, line });
        }

        const purchaseOrgIds = new Set(resolved.map(({ requestEntry }) => requestEntry.purchaseOrgId));
        if (purchaseOrgIds.size !== 1) throw new BadRequestException('禁止跨采购组织合并下推采购订单');
        const billTypes = new Set(resolved.map(({ requestEntry }) => requestEntry.purchaseRequest.billType || PurchaseBillType.STANDARD_PURCHASE));
        const businessTypes = new Set(resolved.map(({ requestEntry }) => requestEntry.purchaseRequest.businessType || PurchaseBusinessType.STANDARD));
        if (billTypes.size !== 1 || businessTypes.size !== 1) throw new BadRequestException('禁止混合不同采购业务类型下推采购订单');
        const payloadHash = this.calculateResolvedPushPayloadHash(dto, resolved);
        const existingAfterSourceLock = await this.findByPushIdempotencyKey(dto.idempotencyKey, manager);
        if (existingAfterSourceLock) return this.assertIdempotentPush(existingAfterSourceLock, dto, payloadHash);

        const first = resolved[0].requestEntry;
        const order = manager.create(PurchaseOrder, {
          orderNo: generateDocumentNo('PO'),
          billType: first.purchaseRequest.billType || PurchaseBillType.STANDARD_PURCHASE,
          businessType: first.purchaseRequest.businessType || PurchaseBusinessType.STANDARD,
          supplierId: dto.supplierId,
          purchaseOrgId: first.purchaseOrgId,
          sourceType: PurchaseOrderSourceType.PURCHASE_REQUEST,
          pushIdempotencyKey: dto.idempotencyKey,
          pushPayloadHash: payloadHash,
          contractNo: dto.contractNo,
          orderDate: dto.orderDate ? new Date(dto.orderDate) : new Date(),
          currencyId: dto.currencyId,
          paymentTermId: dto.paymentTermId,
          buyerId: dto.buyerId,
          remark: dto.remark,
          status: PurchaseOrderStatus.DRAFT,
          sourceId: first.purchaseRequestId,
          sourceNo: first.purchaseRequest.requestNo,
          materialId: first.materialId,
          materialCode: first.materialCode,
          materialName: first.materialName,
          quantity: resolved[0].line.quantity,
          unitPrice: resolved[0].line.unitPrice ?? first.estimatedPrice ?? 0,
          totalAmount: 0,
          totalTax: 0,
          totalNetAmount: 0,
        });
        const saved = await manager.save(order);
        saved.entries = await manager.save(
          resolved.map(({ requestEntry, line }, index) => {
            const effectiveLine = {
              ...line,
              unitPrice: line.unitPrice ?? Number(requestEntry.estimatedPrice || 0),
            };
            const money = this.calculateLine(effectiveLine);
            return manager.create(PurchaseOrderEntry, {
              purchaseOrderId: saved.id,
              lineNo: index + 1,
              supplierId: dto.supplierId,
              expenseItemCode: requestEntry.expenseItemCode,
              expenseItemName: requestEntry.expenseItemName,
              materialId: requestEntry.materialId,
              materialCode: requestEntry.materialCode,
              materialName: requestEntry.materialName,
              materialModel: requestEntry.materialModel,
              unitId: requestEntry.unitId,
              unitCode: requestEntry.unitCode,
              unitName: requestEntry.unitName,
              orderQty: money.qty,
              receivedQty: 0,
              stockedQty: 0,
              unitPrice: money.unitPrice,
              taxRate: money.taxRate,
              amount: money.amount,
              taxAmount: money.taxAmount,
              netAmount: money.netAmount,
              deliveryDate: line.deliveryDate ? new Date(line.deliveryDate) : requestEntry.requiredDate,
              warehouseId: line.warehouseId || requestEntry.warehouseId,
              checkIncoming: first.purchaseRequest.businessType === PurchaseBusinessType.EXPENSE_PURCHASE
                ? false
                : line.checkIncoming ?? true,
              sourceRequestId: requestEntry.purchaseRequestId,
              sourceRequestNo: requestEntry.purchaseRequest.requestNo,
              sourceRequestEntryId: requestEntry.id,
              remark: line.remark,
            });
          }),
        );
        this.recalculateTotals(saved);
        await manager.save(saved);

        return this.present(saved);
      });
    } catch (error) {
      if (this.isPushIdempotencyUniqueViolation(error)) {
        const concurrent = await this.findByPushIdempotencyKey(dto.idempotencyKey);
        if (concurrent) return this.assertIdempotentPush(concurrent, dto);
      }
      throw error;
    }
  }

  async update(id: string, dto: UpdatePurchaseOrderDto) {
    return this.dataSource.transaction(async (manager) => {
      const order = await this.findEntityById(id, manager, true);
      if (!order) throw new NotFoundException('采购订单不存在');
      if (![PurchaseOrderStatus.DRAFT, PurchaseOrderStatus.REJECTED].includes(order.status)) {
        throw new BadRequestException('只有草稿或已驳回采购订单允许修改');
      }
      if (dto.contractNo !== undefined && !dto.contractNo.trim()) throw new BadRequestException('合同号不能为空');
      if (
        order.sourceType === PurchaseOrderSourceType.PURCHASE_REQUEST &&
        dto.purchaseOrgId !== undefined &&
        dto.purchaseOrgId !== order.purchaseOrgId
      ) {
        throw new BadRequestException('采购申请来源订单的采购组织必须与来源申请一致');
      }
      const { entries: sourceEntries, ...header } = dto;
      Object.assign(order, {
        ...header,
        orderDate: dto.orderDate ? new Date(dto.orderDate) : order.orderDate,
        deliveryDate: dto.deliveryDate ? new Date(dto.deliveryDate) : order.deliveryDate,
      });

      if (sourceEntries) {
        const duplicateIds = sourceEntries
          .map((item) => item.id)
          .filter((entryId): entryId is string => Boolean(entryId))
          .filter((entryId, index, all) => all.indexOf(entryId) !== index);
        if (duplicateIds.length) throw new BadRequestException('采购订单明细ID不能重复');
        const activeEntries = order.entries.filter((entry) => entry.isDeleted === 0);
        const existingById = new Map(activeEntries.map((entry) => [entry.id, entry]));
        for (const item of sourceEntries) {
          if (item.id && !existingById.has(item.id)) {
            throw new BadRequestException(`采购订单明细 ${item.id} 不属于当前采购订单`);
          }
          if (!item.id && order.sourceType === PurchaseOrderSourceType.PURCHASE_REQUEST) {
            throw new BadRequestException('采购申请来源订单不能通过普通修改接口新增无来源明细');
          }
        }
        const retainedIds = new Set(sourceEntries.map((item) => item.id).filter(Boolean));
        for (const existing of activeEntries) {
          if (retainedIds.has(existing.id)) continue;
          if (Number(existing.receivedQty || 0) > 0 || Number(existing.stockedQty || 0) > 0) {
            throw new BadRequestException(`采购订单明细第${existing.lineNo}行已有执行数量，不允许删除`);
          }
          existing.isDeleted = 1;
          await manager.save(existing);
        }

        const nextEntries: PurchaseOrderEntry[] = [];
        for (let index = 0; index < sourceEntries.length; index += 1) {
          const item = sourceEntries[index];
          const existing = item.id ? existingById.get(item.id) : undefined;
          if (
            existing &&
            Number(item.orderQty) + 0.000001 <
              Math.max(Number(existing.receivedQty || 0), Number(existing.stockedQty || 0))
          ) {
            throw new BadRequestException(`采购订单明细第${existing.lineNo}行数量不能小于已执行数量`);
          }
          const money = this.calculateLine(item);
          const entry =
            existing ||
            manager.create(PurchaseOrderEntry, {
              purchaseOrderId: order.id,
              receivedQty: 0,
              stockedQty: 0,
            });
          const sourceFields =
            existing && order.sourceType === PurchaseOrderSourceType.PURCHASE_REQUEST
              ? {
                  materialId: existing.materialId,
                  materialCode: existing.materialCode,
                  materialName: existing.materialName,
                  materialModel: existing.materialModel,
                  expenseItemCode: existing.expenseItemCode,
                  expenseItemName: existing.expenseItemName,
                  unitId: existing.unitId,
                  unitCode: existing.unitCode,
                  unitName: existing.unitName,
                  sourceRequestId: existing.sourceRequestId,
                  sourceRequestNo: existing.sourceRequestNo,
                  sourceRequestEntryId: existing.sourceRequestEntryId,
                }
              : {
                  materialId: item.materialId,
                  materialCode: item.materialCode,
                  materialName: item.materialName,
                  materialModel: item.materialModel,
                  unitId: item.unitId,
                  unitCode: item.unitCode,
                  unitName: item.unitName,
                };
          Object.assign(entry, sourceFields, {
            lineNo: index + 1,
            supplierId: order.supplierId,
            orderQty: money.qty,
            unitPrice: money.unitPrice,
            taxRate: money.taxRate,
            amount: money.amount,
            taxAmount: money.taxAmount,
            netAmount: money.netAmount,
            deliveryDate: item.deliveryDate ? new Date(item.deliveryDate) : order.deliveryDate,
            warehouseId: order.businessType === PurchaseBusinessType.EXPENSE_PURCHASE
              ? null
              : item.warehouseId || order.warehouseId,
            checkIncoming: order.businessType === PurchaseBusinessType.EXPENSE_PURCHASE
              ? false
              : item.checkIncoming ?? existing?.checkIncoming ?? true,
            remark: item.remark,
            isDeleted: 0,
          });
          nextEntries.push(await manager.save(entry));
        }
        order.entries = nextEntries;
      } else if (dto.supplierId) {
        for (const entry of order.entries.filter((item) => item.isDeleted === 0)) {
          entry.supplierId = dto.supplierId;
          await manager.save(entry);
        }
      }

      const active = order.entries.filter((entry) => entry.isDeleted === 0);
      const first = active[0];
      if (!first) throw new BadRequestException('采购订单至少需要一条有效明细');
      order.materialId = first.materialId;
      order.materialCode = first.materialCode;
      order.materialName = first.materialName;
      order.quantity = Number(first.orderQty);
      order.unitPrice = Number(first.unitPrice || 0);
      order.entries = active;
      this.recalculateTotals(order);
      await manager.save(order);
      return this.present(order);
    });
  }

  async remove(id: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const order = await this.findEntityById(id, manager, true);
      if (!order) throw new NotFoundException('采购订单不存在');
      if (order.status !== PurchaseOrderStatus.DRAFT) throw new BadRequestException('只有草稿采购订单允许删除');
      order.isDeleted = 1;
      await manager.save(order);
    });
  }

  async submit(id: string) {
    const order = await this.findEntityById(id);
    if (!order) throw new NotFoundException('采购订单不存在');
    if (![PurchaseOrderStatus.DRAFT, PurchaseOrderStatus.REJECTED].includes(order.status)) {
      throw new BadRequestException('只有草稿或已驳回采购订单允许提交');
    }
    if (!order.contractNo?.trim()) throw new BadRequestException('采购订单合同号不能为空');
    if (!order.purchaseOrgId) throw new BadRequestException('采购订单采购组织不能为空');
    if (!order.entries.length) throw new BadRequestException('采购订单至少需要一条明细');
    for (const entry of order.entries.filter((item) => item.isDeleted === 0)) {
      if (
        order.businessType === PurchaseBusinessType.EXPENSE_PURCHASE
        && !entry.expenseItemName?.trim()
      ) {
        throw new BadRequestException(`费用采购订单明细第${entry.lineNo}行费用项目名称不能为空`);
      }
      if (
        order.businessType !== PurchaseBusinessType.EXPENSE_PURCHASE
        && (!entry.materialId || !entry.materialCode || !entry.materialName || !entry.unitId)
      ) {
        throw new BadRequestException(`采购订单明细第${entry.lineNo}行物料和单位不能为空`);
      }
    }
    order.status = PurchaseOrderStatus.SUBMITTED;
    await this.orderRepository.save(order);
    return this.present(order);
  }

  async approve(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const order = await this.findEntityById(id, manager, true);
      if (!order) throw new NotFoundException('采购订单不存在');
      if (order.status !== PurchaseOrderStatus.SUBMITTED) throw new BadRequestException('只有待审核采购订单允许审核');
      const activeEntries = order.entries.filter((entry) => entry.isDeleted === 0);
      if (!activeEntries.length) throw new BadRequestException('采购订单至少需要一条有效明细');

      const affectedRequestIds = new Set<string>();
      for (const orderEntry of activeEntries) {
        if (!orderEntry.sourceRequestEntryId) continue;
        const requestEntry = await manager.findOne(PurchaseRequestEntry, {
          where: { id: orderEntry.sourceRequestEntryId, isDeleted: 0 },
          relations: { purchaseRequest: true },
          lock: { mode: 'pessimistic_write' },
        });
        if (!requestEntry || !requestEntry.purchaseRequest) {
          throw new BadRequestException(`来源采购申请明细不存在: ${orderEntry.sourceRequestEntryId}`);
        }
        if (requestEntry.purchaseRequest.status !== PurchaseRequestStatus.APPROVED) {
          throw new BadRequestException(
            `来源采购申请 ${requestEntry.purchaseRequest.requestNo} 当前状态不允许订单审核占用`,
          );
        }
        const approveQty = Number(requestEntry.approveQty ?? requestEntry.requestQty);
        const purchasedQty = Number(requestEntry.purchasedQty || 0);
        const remaining = approveQty - purchasedQty;
        if (Number(orderEntry.orderQty) - remaining > 0.000001) {
          throw new BadRequestException(
            `采购申请 ${requestEntry.purchaseRequest.requestNo} 第${requestEntry.lineNo}行剩余可采购数量为 ${Math.max(0, remaining)}，订单数量为 ${orderEntry.orderQty}`,
          );
        }
        requestEntry.purchasedQty = purchasedQty + Number(orderEntry.orderQty);
        affectedRequestIds.add(requestEntry.purchaseRequestId);
        await manager.save(requestEntry);
      }
      await this.refreshRequestStatuses(manager, [...affectedRequestIds]);
      order.status = PurchaseOrderStatus.APPROVED;
      await manager.save(order);
      return this.present(order);
    });
  }

  async reject(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const order = await this.findEntityById(id, manager, true);
      if (!order) throw new NotFoundException('采购订单不存在');
      if (order.status !== PurchaseOrderStatus.SUBMITTED) throw new BadRequestException('只有待审核采购订单允许驳回');
      order.status = PurchaseOrderStatus.REJECTED;
      await manager.save(order);
      return this.present(order);
    });
  }

  async cancel(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const order = await this.findEntityById(id, manager, true);
      if (!order) throw new NotFoundException('采购订单不存在');
      if (order.status === PurchaseOrderStatus.CANCELED) return this.present(order);
      if (
        ![PurchaseOrderStatus.DRAFT, PurchaseOrderStatus.SUBMITTED, PurchaseOrderStatus.APPROVED].includes(order.status)
      ) {
        throw new BadRequestException('当前状态采购订单不允许取消');
      }
      const activeEntries = order.entries.filter((entry) => entry.isDeleted === 0);
      if (activeEntries.some((entry) => Number(entry.receivedQty || 0) > 0 || Number(entry.stockedQty || 0) > 0)) {
        throw new BadRequestException('已有收料或入库数量的采购订单不允许取消');
      }
      const downstreamReceiveNoticeCount = await manager.count(PurchaseReceiveNotice, {
        where: {
          purchaseOrderId: order.id,
          status: Not(PurchaseReceiveNoticeStatus.CANCELED),
          isDeleted: 0,
        },
      });
      if (downstreamReceiveNoticeCount > 0) {
        throw new BadRequestException('存在未取消收料通知的采购订单不允许取消');
      }

      const affectedRequestIds = new Set<string>();
      if (
        order.status === PurchaseOrderStatus.APPROVED &&
        order.sourceType === PurchaseOrderSourceType.PURCHASE_REQUEST
      ) {
        for (const orderEntry of activeEntries) {
          if (!orderEntry.sourceRequestEntryId) {
            throw new BadRequestException(`采购订单第${orderEntry.lineNo}行缺少来源采购申请明细，无法恢复申请数量`);
          }
          const requestEntry = await manager.findOne(PurchaseRequestEntry, {
            where: { id: orderEntry.sourceRequestEntryId, isDeleted: 0 },
            relations: { purchaseRequest: true },
            lock: { mode: 'pessimistic_write' },
          });
          if (!requestEntry || !requestEntry.purchaseRequest) {
            throw new BadRequestException(`来源采购申请明细不存在: ${orderEntry.sourceRequestEntryId}`);
          }
          const purchasedQty = Number(requestEntry.purchasedQty || 0);
          const orderQty = Number(orderEntry.orderQty || 0);
          if (purchasedQty + 0.000001 < orderQty) {
            throw new BadRequestException(
              `采购申请 ${requestEntry.purchaseRequest.requestNo} 第${requestEntry.lineNo}行已采购数量 ${purchasedQty} 小于待恢复订单数量 ${orderQty}`,
            );
          }
          requestEntry.purchasedQty = purchasedQty - orderQty;
          affectedRequestIds.add(requestEntry.purchaseRequestId);
          await manager.save(requestEntry);
        }
        await this.refreshRequestStatuses(manager, [...affectedRequestIds]);
      }

      order.status = PurchaseOrderStatus.CANCELED;
      await manager.save(order);
      return this.present(order);
    });
  }

  async close(id: string) {
    return this.changeStatus(
      id,
      [PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.FULLY_STOCKED],
      PurchaseOrderStatus.CLOSED,
      '只有已审核或已全部入库的采购订单允许关闭',
    );
  }

  private async changeStatus(id: string, from: PurchaseOrderStatus[], to: PurchaseOrderStatus, message: string) {
    const order = await this.findEntityById(id);
    if (!order) throw new NotFoundException('采购订单不存在');
    if (!from.includes(order.status)) throw new BadRequestException(message);
    order.status = to;
    await this.orderRepository.save(order);
    return this.present(order);
  }

  private recalculateTotals(order: PurchaseOrder) {
    order.totalAmount = Number(order.entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0).toFixed(2));
    order.totalTax = Number(order.entries.reduce((sum, entry) => sum + Number(entry.taxAmount || 0), 0).toFixed(2));
    order.totalNetAmount = Number(
      order.entries.reduce((sum, entry) => sum + Number(entry.netAmount || 0), 0).toFixed(2),
    );
  }

  private async refreshRequestStatuses(manager: EntityManager, requestIds: string[]) {
    for (const requestId of requestIds) {
      const request = await manager.findOne(PurchaseRequest, {
        where: { id: requestId, isDeleted: 0 },
        relations: { entries: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!request || [PurchaseRequestStatus.CANCELED, PurchaseRequestStatus.CLOSED].includes(request.status)) continue;
      const activeEntries = request.entries.filter((entry) => entry.isDeleted === 0);
      const fullyOrdered =
        activeEntries.length > 0 &&
        activeEntries.every(
          (entry) => Number(entry.purchasedQty || 0) >= Number(entry.approveQty ?? entry.requestQty) - 0.000001,
        );
      request.status = fullyOrdered ? PurchaseRequestStatus.FULLY_ORDERED : PurchaseRequestStatus.APPROVED;
      const first = activeEntries[0];
      if (first) request.purchasedQty = Number(first.purchasedQty || 0);
      await manager.save(request);
    }
  }

  async applyApprovedChange(
    orderId: string,
    lines: ApprovedPurchaseOrderChangeLine[],
    manager: EntityManager,
    operatedBy?: string,
  ) {
    const order = await this.findEntityById(orderId, manager, true);
    if (!order) throw new NotFoundException('来源采购订单不存在');
    if (order.status !== PurchaseOrderStatus.APPROVED) {
      throw new BadRequestException('只有已审核且未完成、未关闭的采购订单允许变更');
    }
    if (!lines.length || new Set(lines.map((line) => line.sourceOrderEntryId)).size !== lines.length) {
      throw new BadRequestException('采购订单变更明细不能为空或重复');
    }

    const entries = await manager.getRepository(PurchaseOrderEntry)
      .createQueryBuilder('entry')
      .where('entry.purchaseOrderId = :orderId', { orderId })
      .andWhere('entry.isDeleted = 0')
      .orderBy('entry.id', 'ASC')
      .setLock('pessimistic_write')
      .getMany();
    const entryById = new Map(entries.map((entry) => [entry.id, entry]));
    const requestDeltas = new Map<string, number>();
    const affectedRequestIds = new Set<string>();
    const sameDate = (left?: Date, right?: Date) => (left ? new Date(left).getTime() : 0) === (right ? new Date(right).getTime() : 0);
    const sameText = (left?: string, right?: string) => (left || '') === (right || '');

    for (const line of [...lines].sort((left, right) => left.sourceOrderEntryId.localeCompare(right.sourceOrderEntryId))) {
      const entry = entryById.get(line.sourceOrderEntryId);
      if (!entry) throw new BadRequestException(`来源采购订单明细不存在: ${line.sourceOrderEntryId}`);
      if (
        Math.abs(Number(entry.orderQty) - Number(line.oldOrderQty)) > 0.000001
        || Math.abs(Number(entry.unitPrice) - Number(line.oldUnitPrice)) > 0.000001
        || !sameDate(entry.deliveryDate, line.oldDeliveryDate)
        || !sameText(entry.warehouseId, line.oldWarehouseId)
        || !sameText(entry.remark, line.oldRemark)
      ) {
        throw new BadRequestException(`采购订单第${entry.lineNo}行变更基线已失效，请重新创建变更单`);
      }
      if (Number(line.newOrderQty) <= 0) throw new BadRequestException(`采购订单第${entry.lineNo}行新数量必须大于0`);
      if (Number(line.newUnitPrice) < 0) throw new BadRequestException(`采购订单第${entry.lineNo}行新单价不能小于0`);
      const executedQty = Math.max(Number(entry.receivedQty || 0), Number(entry.stockedQty || 0));
      if (Number(line.newOrderQty) + 0.000001 < executedQty) {
        throw new BadRequestException(`采购订单第${entry.lineNo}行新数量不得小于已收料/已入库数量 ${executedQty}`);
      }
      const delta = Number(line.newOrderQty) - Number(entry.orderQty);
      if (entry.sourceRequestEntryId && Math.abs(delta) > 0.000001) {
        requestDeltas.set(entry.sourceRequestEntryId, (requestDeltas.get(entry.sourceRequestEntryId) || 0) + delta);
      }
      const amount = Number((Number(line.newOrderQty) * Number(line.newUnitPrice)).toFixed(2));
      const taxAmount = Number(((amount * Number(entry.taxRate || 0)) / 100).toFixed(2));
      entry.orderQty = Number(line.newOrderQty);
      entry.unitPrice = Number(line.newUnitPrice);
      entry.amount = amount;
      entry.taxAmount = taxAmount;
      entry.netAmount = Number((amount + taxAmount).toFixed(2));
      entry.deliveryDate = line.newDeliveryDate ? new Date(line.newDeliveryDate) : null;
      entry.warehouseId = line.newWarehouseId || null;
      entry.remark = line.newRemark || null;
      entry.updatedBy = operatedBy || null;
    }

    for (const requestEntryId of [...requestDeltas.keys()].sort()) {
      const requestEntry = await manager.findOne(PurchaseRequestEntry, {
        where: { id: requestEntryId, isDeleted: 0 },
        relations: { purchaseRequest: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!requestEntry || !requestEntry.purchaseRequest) {
        throw new BadRequestException(`来源采购申请明细不存在: ${requestEntryId}`);
      }
      if (![PurchaseRequestStatus.APPROVED, PurchaseRequestStatus.FULLY_ORDERED].includes(requestEntry.purchaseRequest.status)) {
        throw new BadRequestException(`来源采购申请 ${requestEntry.purchaseRequest.requestNo} 当前状态不允许调整已采购数量`);
      }
      const nextPurchasedQty = Number(requestEntry.purchasedQty || 0) + Number(requestDeltas.get(requestEntryId));
      const approvedQty = Number(requestEntry.approveQty ?? requestEntry.requestQty);
      if (nextPurchasedQty < -0.000001 || nextPurchasedQty - approvedQty > 0.000001) {
        throw new BadRequestException(
          `采购申请 ${requestEntry.purchaseRequest.requestNo} 第${requestEntry.lineNo}行变更后已采购数量超出 0-${approvedQty} 范围`,
        );
      }
      requestEntry.purchasedQty = Number(Math.max(0, nextPurchasedQty).toFixed(4));
      requestEntry.updatedBy = operatedBy || null;
      affectedRequestIds.add(requestEntry.purchaseRequestId);
      await manager.save(requestEntry);
    }

    await manager.save(entries);
    await this.refreshRequestStatuses(manager, [...affectedRequestIds]);
    order.entries = entries;
    this.recalculateTotals(order);
    const first = entries.sort((left, right) => left.lineNo - right.lineNo)[0];
    if (first) {
      order.materialId = first.materialId;
      order.materialCode = first.materialCode;
      order.materialName = first.materialName;
      order.quantity = Number(first.orderQty);
      order.unitPrice = Number(first.unitPrice);
    }
    order.updatedBy = operatedBy || null;
    return manager.save(order);
  }

  async getStatistics(period?: string) {
    const query = this.orderRepository.createQueryBuilder('po').where('po.isDeleted = 0');
    if (period === 'month') {
      const now = new Date();
      query.andWhere('po.orderDate >= :start', {
        start: new Date(now.getFullYear(), now.getMonth(), 1),
      });
    } else if (period === 'quarter') {
      const now = new Date();
      query.andWhere('po.orderDate >= :start', {
        start: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1),
      });
    }
    const totalOrders = await query.getCount();
    const totalAmount = await query.clone().select('SUM(po.totalAmount)', 'total').getRawOne();
    const byStatus = await query
      .clone()
      .select('po.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('po.status')
      .getRawMany();
    return {
      totalOrders,
      totalAmount: Number(totalAmount?.total) || 0,
      byStatus: byStatus.map((item) => ({
        status: Number(item.status),
        count: Number(item.count),
      })),
    };
  }
}
