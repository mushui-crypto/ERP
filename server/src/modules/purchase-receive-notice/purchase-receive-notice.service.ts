import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { InventoryInEntry } from '../../database/entities/inventory-in-entry.entity';
import { PurchaseOrderEntry } from '../../database/entities/purchase-order-entry.entity';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';
import { PurchaseReceiveNoticeEntry } from '../../database/entities/purchase-receive-notice-entry.entity';
import { PurchaseReceiveNoticeReversalEntry } from '../../database/entities/purchase-receive-notice-reversal-entry.entity';
import { PurchaseReceiveNoticeReversal } from '../../database/entities/purchase-receive-notice-reversal.entity';
import { PurchaseReceiveNotice } from '../../database/entities/purchase-receive-notice.entity';
import { QualityInspection } from '../../database/entities/quality-inspection.entity';
import { PurchaseReturnEntry } from '../../database/entities/purchase-return-entry.entity';
import { PurchaseReturn } from '../../database/entities/purchase-return.entity';
import {
  generateDocumentNo,
  PURCHASE_RECEIVE_NOTICE_STATUS_META,
  PurchaseOrderStatus,
  PurchaseReceiveNoticeStatus,
  PurchaseReturnMode,
  PurchaseReturnStatus,
  withStatusMeta,
} from '../purchase-common/purchase-status';
import {
  PushPurchaseOrderToReceiveNoticeDto,
  ReversePurchaseReceiveNoticeDto,
  UpdatePurchaseReceiveNoticeDto,
} from './dto/purchase-receive-notice.dto';

const QUANTITY_EPSILON = 0.000001;
const ACTIVE_OCCUPATION_STATUSES = [PurchaseReceiveNoticeStatus.DRAFT, PurchaseReceiveNoticeStatus.SUBMITTED];

interface ReceiveNoticeQuery {
  page: number;
  pageSize: number;
  noticeNo?: string;
  purchaseOrderId?: string;
  supplierId?: string;
  status?: number;
}

@Injectable()
export class PurchaseReceiveNoticeService {
  constructor(
    @InjectRepository(PurchaseReceiveNotice)
    private readonly noticeRepository: Repository<PurchaseReceiveNotice>,
    @InjectRepository(PurchaseReceiveNoticeEntry)
    private readonly noticeEntryRepository: Repository<PurchaseReceiveNoticeEntry>,
    private readonly dataSource: DataSource,
  ) {}

  private presentReversal(reversal: PurchaseReceiveNoticeReversal) {
    return {
      ...reversal,
      entries: (reversal.entries || [])
        .filter((entry) => entry.isDeleted === 0)
        .sort((left, right) => left.lineNo - right.lineNo)
        .map((entry) => ({
          ...entry,
          reversalQty: Number(entry.reversalQty || 0),
          beforeReceivedQty: Number(entry.beforeReceivedQty || 0),
          afterReceivedQty: Number(entry.afterReceivedQty || 0),
        })),
    };
  }

  private async findReversalByIdempotencyKey(idempotencyKey: string, manager?: EntityManager, lock = false) {
    const repository = manager
      ? manager.getRepository(PurchaseReceiveNoticeReversal)
      : this.dataSource.getRepository(PurchaseReceiveNoticeReversal);
    return repository.findOne({
      where: { idempotencyKey, isDeleted: 0 },
      relations: { entries: true },
      ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}),
    });
  }

  private assertIdempotentReversal(
    existing: PurchaseReceiveNoticeReversal,
    noticeId: string,
    dto: ReversePurchaseReceiveNoticeDto,
  ) {
    if (
      existing.sourceNoticeId !== noticeId ||
      existing.reason !== dto.reason.trim() ||
      (existing.operatedBy || '') !== (dto.operatedBy?.trim() || '')
    ) {
      throw new BadRequestException('幂等键已被不同收料通知或不同冲销请求使用');
    }
    return this.presentReversal(existing);
  }

  private isReversalUniqueViolation(error: unknown) {
    const source = error as {
      driverError?: { number?: number; message?: string };
      message?: string;
    };
    const message = `${source?.driverError?.message || ''} ${source?.message || ''}`;
    return (
      [2601, 2627].includes(Number(source?.driverError?.number)) &&
      (message.includes('biz_purchase_receive_notice_reversal') ||
        message.includes('source_notice_id') ||
        message.includes('idempotency_key'))
    );
  }

  private present(notice: PurchaseReceiveNotice) {
    const entries = (notice.entries || [])
      .filter((entry) => entry.isDeleted === 0)
      .sort((a, b) => a.lineNo - b.lineNo)
      .map((entry) => {
        const receiveQty = Number(entry.receiveQty || 0);
        const inspectedQty = Number(entry.inspectedQty || 0);
        const qualifiedQty = Number(entry.qualifiedQty || 0);
        const concessionQty = Number(entry.concessionQty || 0);
        const unqualifiedQty = Number(entry.unqualifiedQty || 0);
        const stockedQty = Number(entry.stockedQty || 0);
        const requiresInspection = Boolean(notice.needCheck && entry.checkIncoming);
        const inboundBaseQty = requiresInspection ? qualifiedQty + concessionQty : receiveQty;
        return {
          ...entry,
          receiveQty,
          inspectedQty,
          qualifiedQty,
          concessionQty,
          unqualifiedQty,
          stockedQty,
          requiresInspection,
          remainingInspectQty: requiresInspection ? Math.max(0, receiveQty - inspectedQty) : 0,
          availableInboundQty: Math.max(0, inboundBaseQty - stockedQty),
        };
      });
    return withStatusMeta({ ...notice, entries }, PURCHASE_RECEIVE_NOTICE_STATUS_META);
  }

  async findAll(query: ReceiveNoticeQuery) {
    const builder = this.noticeRepository
      .createQueryBuilder('notice')
      .leftJoinAndSelect('notice.entries', 'entry', 'entry.isDeleted = 0')
      .where('notice.isDeleted = 0');
    if (query.noticeNo) builder.andWhere('notice.noticeNo LIKE :noticeNo', { noticeNo: `%${query.noticeNo}%` });
    if (query.purchaseOrderId)
      builder.andWhere('notice.purchaseOrderId = :purchaseOrderId', { purchaseOrderId: query.purchaseOrderId });
    if (query.supplierId) builder.andWhere('notice.supplierId = :supplierId', { supplierId: query.supplierId });
    if (query.status !== undefined) builder.andWhere('notice.status = :status', { status: query.status });
    const [list, total] = await builder
      .orderBy('notice.createdAt', 'DESC')
      .addOrderBy('entry.lineNo', 'ASC')
      .skip((query.page - 1) * query.pageSize)
      .take(query.pageSize)
      .getManyAndCount();
    return { list: list.map((notice) => this.present(notice)), total, page: query.page, pageSize: query.pageSize };
  }

  private async findEntityById(id: string, manager?: EntityManager, lock = false) {
    const repository = manager ? manager.getRepository(PurchaseReceiveNotice) : this.noticeRepository;
    return repository.findOne({
      where: { id, isDeleted: 0 },
      relations: { entries: true },
      order: { entries: { lineNo: 'ASC' } },
      ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}),
    });
  }

  async findById(id: string) {
    const notice = await this.findEntityById(id);
    return notice ? this.present(notice) : null;
  }

  private calculateLine(quantity: number, orderEntry: PurchaseOrderEntry) {
    const receiveQty = Number(quantity);
    const unitPrice = Number(orderEntry.unitPrice || 0);
    const taxRate = Number(orderEntry.taxRate || 0);
    const amount = Number((receiveQty * unitPrice).toFixed(2));
    const taxAmount = Number(((amount * taxRate) / 100).toFixed(2));
    return { receiveQty, unitPrice, taxRate, amount, taxAmount, netAmount: amount + taxAmount };
  }

  private async getActiveOccupation(manager: EntityManager, sourceOrderEntryId: string, excludeNoticeId?: string) {
    const query = manager
      .getRepository(PurchaseReceiveNoticeEntry)
      .createQueryBuilder('entry')
      .innerJoin(PurchaseReceiveNotice, 'notice', 'notice.id = entry.purchaseReceiveNoticeId')
      .select('COALESCE(SUM(entry.receiveQty), 0)', 'quantity')
      .where('entry.sourceOrderEntryId = :sourceOrderEntryId', { sourceOrderEntryId })
      .andWhere('entry.isDeleted = 0')
      .andWhere('notice.isDeleted = 0')
      .andWhere('notice.status IN (:...statuses)', { statuses: ACTIVE_OCCUPATION_STATUSES });
    if (excludeNoticeId) query.andWhere('notice.id <> :excludeNoticeId', { excludeNoticeId });
    const row = await query.getRawOne();
    return Number(row?.quantity || 0);
  }

  private sameRetryPayload(existing: PurchaseReceiveNotice, dto: PushPurchaseOrderToReceiveNoticeDto) {
    const existingLines = (existing.entries || []).filter((entry) => entry.isDeleted === 0);
    if (existingLines.length !== dto.lines.length) return false;
    const existingMap = new Map(existingLines.map((entry) => [entry.sourceOrderEntryId, Number(entry.receiveQty)]));
    return dto.lines.every((line) => {
      const quantity = existingMap.get(line.orderEntryId);
      return quantity !== undefined && Math.abs(quantity - Number(line.quantity)) <= QUANTITY_EPSILON;
    });
  }

  async createFromOrder(dto: PushPurchaseOrderToReceiveNoticeDto) {
    return this.dataSource.transaction(async (manager) => {
      const duplicate = await manager.findOne(PurchaseReceiveNotice, {
        where: { purchaseOrderId: dto.purchaseOrderId, receiveBatchNo: dto.receiveBatchNo, isDeleted: 0 },
        relations: { entries: true },
      });
      if (duplicate) {
        if (!this.sameRetryPayload(duplicate, dto)) {
          throw new BadRequestException('同一采购订单与收料批次号已存在，但明细或数量不一致');
        }
        return this.present(duplicate);
      }

      const duplicateEntryIds = dto.lines
        .map((line) => line.orderEntryId)
        .filter((id, index, all) => all.indexOf(id) !== index);
      if (duplicateEntryIds.length) throw new BadRequestException('同一订单明细不能在一张收料通知中重复出现');

      const order = await manager.findOne(PurchaseOrder, {
        where: { id: dto.purchaseOrderId, isDeleted: 0 },
        relations: { entries: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) throw new NotFoundException('来源采购订单不存在');
      if (order.status !== PurchaseOrderStatus.APPROVED) {
        throw new BadRequestException('只有已审核采购订单允许下推收料通知');
      }
      if (!order.purchaseOrgId) throw new BadRequestException('来源采购订单缺少采购组织，不能下推收料通知');
      if (dto.purchaseOrgId !== order.purchaseOrgId) {
        throw new BadRequestException('收料通知采购组织必须与来源采购订单一致');
      }

      const orderEntries = new Map(
        order.entries.filter((entry) => entry.isDeleted === 0).map((entry) => [entry.id, entry]),
      );
      const lockedEntries: PurchaseOrderEntry[] = [];
      for (const line of dto.lines) {
        const source = orderEntries.get(line.orderEntryId);
        if (!source) throw new BadRequestException(`订单明细 ${line.orderEntryId} 不属于当前采购订单`);
        const locked = await manager.findOne(PurchaseOrderEntry, {
          where: { id: source.id, purchaseOrderId: order.id, isDeleted: 0 },
          lock: { mode: 'pessimistic_write' },
        });
        if (!locked) throw new BadRequestException(`订单明细 ${line.orderEntryId} 不存在`);
        const activeOccupation = await this.getActiveOccupation(manager, locked.id);
        const available = Number(locked.orderQty) - Number(locked.receivedQty || 0) - activeOccupation;
        if (Number(line.quantity) - available > QUANTITY_EPSILON) {
          throw new BadRequestException(
            `订单明细 ${locked.lineNo} 可新建收料数量为 ${Math.max(0, available)}，本次为 ${line.quantity}`,
          );
        }
        lockedEntries.push(locked);
      }

      const notice = manager.create(PurchaseReceiveNotice, {
        noticeNo: generateDocumentNo('PRN'),
        billType: order.billType,
        businessType: order.businessType,
        receiveBatchNo: dto.receiveBatchNo,
        purchaseOrderId: order.id,
        purchaseOrderNo: order.orderNo,
        stockOrgId: dto.stockOrgId,
        purchaseOrgId: order.purchaseOrgId,
        supplierId: order.supplierId,
        receiveDate: dto.receiveDate ? new Date(dto.receiveDate) : new Date(),
        sendBillNo: dto.sendBillNo,
        ladBillNo: dto.ladBillNo,
        needCheck: dto.needCheck ?? true,
        receiverId: dto.receiverId,
        receiveDepartmentId: dto.receiveDepartmentId,
        remark: dto.remark,
        status: PurchaseReceiveNoticeStatus.DRAFT,
      });
      const saved = await manager.save(notice);
      saved.entries = await manager.save(
        dto.lines.map((line, index) => {
          const source = lockedEntries[index];
          const money = this.calculateLine(line.quantity, source);
          return manager.create(PurchaseReceiveNoticeEntry, {
            purchaseReceiveNoticeId: saved.id,
            lineNo: index + 1,
            sourceOrderId: order.id,
            sourceOrderNo: order.orderNo,
            sourceOrderEntryId: source.id,
            sourceRequestId: source.sourceRequestId,
            sourceRequestNo: source.sourceRequestNo,
            sourceRequestEntryId: source.sourceRequestEntryId,
            materialId: source.materialId,
            materialCode: source.materialCode,
            materialName: source.materialName,
            materialModel: source.materialModel,
            unitId: source.unitId,
            unitCode: source.unitCode,
            unitName: source.unitName,
            receiveQty: money.receiveQty,
            inspectedQty: 0,
            qualifiedQty: 0,
            concessionQty: 0,
            unqualifiedQty: 0,
            stockedQty: 0,
            assetAcceptedQty: 0,
            checkIncoming: line.checkIncoming ?? source.checkIncoming,
            warehouseId: line.warehouseId || source.warehouseId || order.warehouseId,
            unitPrice: money.unitPrice,
            amount: money.amount,
            taxRate: money.taxRate,
            taxAmount: money.taxAmount,
            netAmount: money.netAmount,
            supplierLot: line.supplierLot,
            produceDate: line.produceDate ? new Date(line.produceDate) : null,
            expiryDate: line.expiryDate ? new Date(line.expiryDate) : null,
            remark: line.remark,
          });
        }),
      );
      return this.present(saved);
    });
  }

  async createFromReturnReplenish(purchaseReturnId: string, transactionManager?: EntityManager) {
    const execute = async (manager: EntityManager) => {
      const purchaseReturn = await manager.findOne(PurchaseReturn, {
        where: { id: purchaseReturnId, isDeleted: 0 },
        relations: { entries: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!purchaseReturn) throw new NotFoundException('采购退料单不存在');
      if (purchaseReturn.status !== PurchaseReturnStatus.APPROVED) throw new BadRequestException('只有已审核采购退料单允许生成补料收料通知');
      if (purchaseReturn.returnMode !== PurchaseReturnMode.REPLENISH) throw new BadRequestException('只有补料方式采购退料单允许生成收料通知');

      const existing = await manager.findOne(PurchaseReceiveNotice, {
        where: { sourcePurchaseReturnId: purchaseReturn.id, isDeleted: 0 },
        relations: { entries: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (existing) return this.present(existing);
      const returnEntries = purchaseReturn.entries.filter((entry) => entry.isDeleted === 0);
      if (!returnEntries.length) throw new BadRequestException('采购退料单没有有效补料明细');
      const orderIds = [...new Set(returnEntries.map((entry) => entry.sourceOrderId))];
      if (orderIds.length !== 1) throw new BadRequestException('一张补料收料通知只能对应一张采购订单');
      const order = await manager.findOne(PurchaseOrder, { where: { id: orderIds[0], isDeleted: 0 } });
      if (!order) throw new BadRequestException('补料来源采购订单不存在');

      const notice = manager.create(PurchaseReceiveNotice, {
        noticeNo: generateDocumentNo('PRN'),
        receiveBatchNo: `REPLENISH:${purchaseReturn.id}`,
        purchaseOrderId: order.id,
        purchaseOrderNo: order.orderNo,
        sourceType: 'PURCHASE_RETURN_REPLENISH',
        sourcePurchaseReturnId: purchaseReturn.id,
        sourcePurchaseReturnNo: purchaseReturn.returnNo,
        stockOrgId: purchaseReturn.stockOrgId,
        purchaseOrgId: purchaseReturn.purchaseOrgId,
        supplierId: purchaseReturn.supplierId,
        receiveDate: new Date(),
        needCheck: true,
        status: PurchaseReceiveNoticeStatus.DRAFT,
        remark: `采购退料 ${purchaseReturn.returnNo} 补料生成`,
      });
      await manager.save(notice);
      const noticeEntries: PurchaseReceiveNoticeEntry[] = [];
      for (let index = 0; index < returnEntries.length; index += 1) {
        const source = returnEntries[index];
        const originalReceiveEntry = await manager.findOne(PurchaseReceiveNoticeEntry, {
          where: { id: source.sourceReceiveNoticeEntryId, isDeleted: 0 },
        });
        const amount = Number((Number(source.returnQty) * Number(source.unitPrice)).toFixed(2));
        const taxAmount = Number(((amount * Number(source.taxRate || 0)) / 100).toFixed(2));
        const entry = manager.create(PurchaseReceiveNoticeEntry, {
          purchaseReceiveNoticeId: notice.id,
          lineNo: index + 1,
          sourceOrderId: source.sourceOrderId,
          sourceOrderNo: order.orderNo,
          sourceOrderEntryId: source.sourceOrderEntryId,
          sourceRequestId: source.sourceRequestId,
          sourceRequestNo: null,
          sourceRequestEntryId: source.sourceRequestEntryId,
          sourcePurchaseReturnEntryId: source.id,
          materialId: source.materialId,
          materialCode: source.materialCode,
          materialName: source.materialName,
          materialModel: source.materialModel,
          unitId: source.unitId,
          unitCode: source.unitCode,
          unitName: source.unitName,
          receiveQty: Number(source.returnQty),
          inspectedQty: 0,
          qualifiedQty: 0,
          concessionQty: 0,
          unqualifiedQty: 0,
          stockedQty: 0,
          checkIncoming: originalReceiveEntry?.checkIncoming ?? true,
          warehouseId: source.warehouseId,
          unitPrice: Number(source.unitPrice),
          amount,
          taxRate: Number(source.taxRate || 0),
          taxAmount,
          netAmount: Number((amount + taxAmount).toFixed(2)),
          supplierLot: source.lotNo || null,
          remark: `采购退料 ${purchaseReturn.returnNo} 补料`,
        });
        const savedEntry = await manager.save(entry);
        source.replenishNoticeEntryId = savedEntry.id;
        await manager.save(source);
        noticeEntries.push(savedEntry);
      }
      notice.entries = noticeEntries;
      purchaseReturn.replenishNoticeId = notice.id;
      purchaseReturn.replenishNoticeNo = notice.noticeNo;
      await manager.save(purchaseReturn);
      return this.present(notice);
    };
    return transactionManager ? execute(transactionManager) : this.dataSource.transaction(execute);
  }

  async update(id: string, dto: UpdatePurchaseReceiveNoticeDto) {
    return this.dataSource.transaction(async (manager) => {
      const notice = await this.findEntityById(id, manager, true);
      if (!notice) throw new NotFoundException('收料通知不存在');
      if (![PurchaseReceiveNoticeStatus.DRAFT, PurchaseReceiveNoticeStatus.REJECTED].includes(notice.status)) {
        throw new BadRequestException('只有草稿或已驳回收料通知允许修改');
      }

      const order = await manager.findOne(PurchaseOrder, {
        where: { id: notice.purchaseOrderId, isDeleted: 0 },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) throw new BadRequestException('来源采购订单不存在');
      const isReturnReplenish = notice.sourceType === 'PURCHASE_RETURN_REPLENISH';
      const allowedOrderStatuses = isReturnReplenish
        ? [PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.FULLY_STOCKED]
        : [PurchaseOrderStatus.APPROVED];
      if (!allowedOrderStatuses.includes(order.status)) {
        throw new BadRequestException('来源采购订单当前状态不允许修改收料通知');
      }
      if (!order.purchaseOrgId) throw new BadRequestException('来源采购订单缺少采购组织，不能修改收料通知');
      if (dto.purchaseOrgId !== undefined && dto.purchaseOrgId !== order.purchaseOrgId) {
        throw new BadRequestException('收料通知采购组织必须与来源采购订单一致');
      }

      Object.assign(notice, {
        stockOrgId: dto.stockOrgId ?? notice.stockOrgId,
        purchaseOrgId: order.purchaseOrgId,
        receiveDate: dto.receiveDate ? new Date(dto.receiveDate) : notice.receiveDate,
        sendBillNo: dto.sendBillNo ?? notice.sendBillNo,
        ladBillNo: dto.ladBillNo ?? notice.ladBillNo,
        needCheck: dto.needCheck ?? notice.needCheck,
        receiverId: dto.receiverId ?? notice.receiverId,
        receiveDepartmentId: dto.receiveDepartmentId ?? notice.receiveDepartmentId,
        remark: dto.remark ?? notice.remark,
      });

      if (dto.lines) {
        if (isReturnReplenish && dto.lines.length !== notice.entries.filter((entry) => entry.isDeleted === 0).length) {
          throw new BadRequestException('退料补料收料通知不允许新增或删除明细');
        }
        const duplicateIds = dto.lines
          .map((line) => line.id)
          .filter((entryId, index, all) => all.indexOf(entryId) !== index);
        if (duplicateIds.length) throw new BadRequestException('收料通知明细ID不能重复');
        const activeEntries = notice.entries.filter((entry) => entry.isDeleted === 0);
        const existingById = new Map(activeEntries.map((entry) => [entry.id, entry]));
        for (const line of dto.lines) {
          const entry = existingById.get(line.id);
          if (!entry) throw new BadRequestException(`收料通知明细 ${line.id} 不属于当前单据`);
        }
        const retainedIds = new Set(dto.lines.map((line) => line.id));
        for (const entry of activeEntries) {
          if (retainedIds.has(entry.id)) continue;
          if (Number(entry.inspectedQty || 0) > 0 || Number(entry.stockedQty || 0) > 0) {
            throw new BadRequestException(`收料通知明细第${entry.lineNo}行已有检验或入库数量，不允许删除`);
          }
          entry.isDeleted = 1;
          await manager.save(entry);
        }

        const nextEntries: PurchaseReceiveNoticeEntry[] = [];
        for (let index = 0; index < dto.lines.length; index += 1) {
          const line = dto.lines[index];
          const entry = existingById.get(line.id)!;
          if (isReturnReplenish) {
            if (Math.abs(Number(line.quantity) - Number(entry.receiveQty)) > QUANTITY_EPSILON) {
              throw new BadRequestException('退料补料收料数量必须等于采购退料数量，不允许修改');
            }
            Object.assign(entry, {
              lineNo: index + 1,
              checkIncoming: line.checkIncoming ?? entry.checkIncoming,
              warehouseId: line.warehouseId ?? entry.warehouseId,
              supplierLot: line.supplierLot ?? entry.supplierLot,
              produceDate: line.produceDate ? new Date(line.produceDate) : entry.produceDate,
              expiryDate: line.expiryDate ? new Date(line.expiryDate) : entry.expiryDate,
              remark: line.remark ?? entry.remark,
              isDeleted: 0,
            });
            nextEntries.push(await manager.save(entry));
            continue;
          }
          const orderEntry = await manager.findOne(PurchaseOrderEntry, {
            where: { id: entry.sourceOrderEntryId, purchaseOrderId: notice.purchaseOrderId, isDeleted: 0 },
            lock: { mode: 'pessimistic_write' },
          });
          if (!orderEntry) throw new BadRequestException(`来源采购订单明细 ${entry.sourceOrderEntryId} 不存在`);
          const activeOccupation = await this.getActiveOccupation(manager, orderEntry.id, notice.id);
          const available = Number(orderEntry.orderQty) - Number(orderEntry.receivedQty || 0) - activeOccupation;
          if (Number(line.quantity) - available > QUANTITY_EPSILON) {
            throw new BadRequestException(
              `订单明细 ${orderEntry.lineNo} 可修改收料数量为 ${Math.max(0, available)}，本次为 ${line.quantity}`,
            );
          }
          const money = this.calculateLine(line.quantity, orderEntry);
          Object.assign(entry, {
            lineNo: index + 1,
            receiveQty: money.receiveQty,
            unitPrice: money.unitPrice,
            amount: money.amount,
            taxRate: money.taxRate,
            taxAmount: money.taxAmount,
            netAmount: money.netAmount,
            checkIncoming: line.checkIncoming ?? entry.checkIncoming,
            warehouseId: line.warehouseId ?? entry.warehouseId,
            supplierLot: line.supplierLot ?? entry.supplierLot,
            produceDate: line.produceDate ? new Date(line.produceDate) : entry.produceDate,
            expiryDate: line.expiryDate ? new Date(line.expiryDate) : entry.expiryDate,
            remark: line.remark ?? entry.remark,
            isDeleted: 0,
          });
          nextEntries.push(await manager.save(entry));
        }
        notice.entries = nextEntries;
      }

      await manager.save(notice);
      return this.present(notice);
    });
  }

  async submit(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const notice = await this.findEntityById(id, manager, true);
      if (!notice) throw new NotFoundException('收料通知不存在');
      if (![PurchaseReceiveNoticeStatus.DRAFT, PurchaseReceiveNoticeStatus.REJECTED].includes(notice.status)) {
        throw new BadRequestException('只有草稿或已驳回收料通知允许提交');
      }
      if (!notice.entries.some((entry) => entry.isDeleted === 0 && Number(entry.receiveQty) > 0)) {
        throw new BadRequestException('收料通知至少需要一条有效明细');
      }
      notice.status = PurchaseReceiveNoticeStatus.SUBMITTED;
      await manager.save(notice);
      return this.present(notice);
    });
  }

  async approve(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const notice = await this.findEntityById(id, manager, true);
      if (!notice) throw new NotFoundException('收料通知不存在');
      if (notice.status !== PurchaseReceiveNoticeStatus.SUBMITTED)
        throw new BadRequestException('只有待审核收料通知允许审核');
      const entries = notice.entries.filter((entry) => entry.isDeleted === 0);
      for (const entry of entries) {
        if (notice.sourceType === 'PURCHASE_RETURN_REPLENISH') {
          const returnEntry = await manager.findOne(PurchaseReturnEntry, {
            where: { id: entry.sourcePurchaseReturnEntryId, isDeleted: 0 },
            lock: { mode: 'pessimistic_write' },
          });
          if (!returnEntry) throw new BadRequestException('补料来源采购退料明细不存在');
          const remaining = Number(returnEntry.returnQty) - Number(returnEntry.replenishedReceivedQty || 0);
          if (Number(entry.receiveQty) - remaining > QUANTITY_EPSILON) {
            throw new BadRequestException(`采购退料第${returnEntry.lineNo}行剩余可补料收料数量为 ${Math.max(0, remaining)}`);
          }
          returnEntry.replenishedReceivedQty = Number(returnEntry.replenishedReceivedQty || 0) + Number(entry.receiveQty);
          await manager.save(returnEntry);
          continue;
        }
        const orderEntry = await manager.findOne(PurchaseOrderEntry, {
          where: { id: entry.sourceOrderEntryId, purchaseOrderId: notice.purchaseOrderId, isDeleted: 0 },
          lock: { mode: 'pessimistic_write' },
        });
        if (!orderEntry) throw new BadRequestException(`来源采购订单明细 ${entry.sourceOrderEntryId} 不存在`);
        const remaining = Number(orderEntry.orderQty) - Number(orderEntry.receivedQty || 0);
        if (Number(entry.receiveQty) - remaining > QUANTITY_EPSILON) {
          throw new BadRequestException(
            `订单明细 ${orderEntry.lineNo} 剩余可审核收料数量为 ${Math.max(0, remaining)}，本次为 ${entry.receiveQty}`,
          );
        }
        orderEntry.receivedQty = Number(orderEntry.receivedQty || 0) + Number(entry.receiveQty);
        await manager.save(orderEntry);
      }
      notice.status = PurchaseReceiveNoticeStatus.APPROVED;
      notice.approvedAt = new Date();
      await manager.save(notice);
      return this.present(notice);
    });
  }

  async reverse(id: string, dto: ReversePurchaseReceiveNoticeDto) {
    const existing = await this.findReversalByIdempotencyKey(dto.idempotencyKey);
    if (existing) return this.assertIdempotentReversal(existing, id, dto);

    try {
      return await this.dataSource.transaction(async (manager) => {
        const concurrentExisting = await this.findReversalByIdempotencyKey(dto.idempotencyKey, manager, true);
        if (concurrentExisting) return this.assertIdempotentReversal(concurrentExisting, id, dto);

        const notice = await this.findEntityById(id, manager, true);
        if (!notice) throw new NotFoundException('收料通知不存在');
        if (notice.status === PurchaseReceiveNoticeStatus.REVERSED) {
          const completed = await manager.findOne(PurchaseReceiveNoticeReversal, {
            where: { sourceNoticeId: notice.id, isDeleted: 0 },
            relations: { entries: true },
          });
          if (completed?.idempotencyKey === dto.idempotencyKey) {
            return this.assertIdempotentReversal(completed, id, dto);
          }
          throw new BadRequestException('收料通知已冲销，不允许使用新的幂等键重复冲销');
        }
        if (notice.status !== PurchaseReceiveNoticeStatus.APPROVED) {
          throw new BadRequestException('只有已审核收料通知允许冲销');
        }

        const activeEntries = notice.entries.filter((entry) => entry.isDeleted === 0);
        if (!activeEntries.length) throw new BadRequestException('收料通知缺少有效明细');
        for (const entry of activeEntries) {
          if (
            Number(entry.stockedQty || 0) > QUANTITY_EPSILON ||
            Number(entry.inspectedQty || 0) > QUANTITY_EPSILON ||
            Number(entry.qualifiedQty || 0) > QUANTITY_EPSILON ||
            Number(entry.unqualifiedQty || 0) > QUANTITY_EPSILON ||
            Number(entry.concessionQty || 0) > QUANTITY_EPSILON
          ) {
            throw new BadRequestException(`收料通知第${entry.lineNo}行已有检验结果或入库数量，不允许冲销`);
          }
        }

        const hasInspection = await manager.exists(QualityInspection, {
          where: { sourceReceiveNoticeId: notice.id, isDeleted: 0 },
        });
        if (hasInspection) throw new BadRequestException('收料通知已生成来料检验单，不允许冲销');
        const hasInventoryIn = await manager.exists(InventoryInEntry, {
          where: { sourceReceiveNoticeId: notice.id, isDeleted: 0 },
        });
        if (hasInventoryIn) throw new BadRequestException('收料通知已生成采购入库单，不允许冲销');

        const reversalDate = new Date();
        const reversal = manager.create(PurchaseReceiveNoticeReversal, {
          reversalNo: generateDocumentNo('PRNR'),
          sourceNoticeId: notice.id,
          sourceNoticeNo: notice.noticeNo,
          purchaseOrderId: notice.purchaseOrderId,
          purchaseOrderNo: notice.purchaseOrderNo,
          purchaseOrgId: notice.purchaseOrgId,
          stockOrgId: notice.stockOrgId,
          supplierId: notice.supplierId,
          reversalDate,
          reason: dto.reason.trim(),
          operatedBy: dto.operatedBy?.trim() || null,
          idempotencyKey: dto.idempotencyKey,
          status: 'COMPLETED',
          createdBy: dto.operatedBy?.trim() || null,
          updatedBy: dto.operatedBy?.trim() || null,
        });
        await manager.save(reversal);

        const reversalEntries: PurchaseReceiveNoticeReversalEntry[] = [];
        const entriesToReverse = [...activeEntries].sort((left, right) =>
          left.sourceOrderEntryId.localeCompare(right.sourceOrderEntryId),
        );
        for (const noticeEntry of entriesToReverse) {
          if (notice.sourceType === 'PURCHASE_RETURN_REPLENISH') {
            const returnEntry = await manager.findOne(PurchaseReturnEntry, {
              where: { id: noticeEntry.sourcePurchaseReturnEntryId, isDeleted: 0 },
              lock: { mode: 'pessimistic_write' },
            });
            if (!returnEntry) throw new BadRequestException('补料来源采购退料明细不存在');
            const beforeReceivedQty = Number(returnEntry.replenishedReceivedQty || 0);
            const reversalQty = Number(noticeEntry.receiveQty || 0);
            if (beforeReceivedQty + QUANTITY_EPSILON < reversalQty) {
              throw new BadRequestException(`采购退料第${returnEntry.lineNo}行累计补料收料数量不足，不能冲销`);
            }
            const afterReceivedQty = beforeReceivedQty - reversalQty;
            returnEntry.replenishedReceivedQty = afterReceivedQty;
            await manager.save(returnEntry);
            reversalEntries.push(manager.create(PurchaseReceiveNoticeReversalEntry, {
              reversalId: reversal.id,
              lineNo: noticeEntry.lineNo,
              sourceNoticeEntryId: noticeEntry.id,
              sourceOrderEntryId: noticeEntry.sourceOrderEntryId,
              materialId: noticeEntry.materialId,
              unitId: noticeEntry.unitId,
              reversalQty,
              beforeReceivedQty,
              afterReceivedQty,
              createdBy: dto.operatedBy?.trim() || null,
              updatedBy: dto.operatedBy?.trim() || null,
            }));
            continue;
          }
          const orderEntry = await manager.findOne(PurchaseOrderEntry, {
            where: {
              id: noticeEntry.sourceOrderEntryId,
              purchaseOrderId: notice.purchaseOrderId,
              isDeleted: 0,
            },
            lock: { mode: 'pessimistic_write' },
          });
          if (!orderEntry) {
            throw new BadRequestException(`来源采购订单明细不存在: ${noticeEntry.sourceOrderEntryId}`);
          }
          const beforeReceivedQty = Number(orderEntry.receivedQty || 0);
          const reversalQty = Number(noticeEntry.receiveQty || 0);
          if (beforeReceivedQty + QUANTITY_EPSILON < reversalQty) {
            throw new BadRequestException(
              `采购订单第${orderEntry.lineNo}行累计收料数量 ${beforeReceivedQty} 小于待冲销数量 ${reversalQty}`,
            );
          }
          const afterReceivedQty = beforeReceivedQty - reversalQty;
          orderEntry.receivedQty = afterReceivedQty;
          await manager.save(orderEntry);

          reversalEntries.push(
            manager.create(PurchaseReceiveNoticeReversalEntry, {
              reversalId: reversal.id,
              lineNo: noticeEntry.lineNo,
              sourceNoticeEntryId: noticeEntry.id,
              sourceOrderEntryId: noticeEntry.sourceOrderEntryId,
              materialId: noticeEntry.materialId,
              unitId: noticeEntry.unitId,
              reversalQty,
              beforeReceivedQty,
              afterReceivedQty,
              createdBy: dto.operatedBy?.trim() || null,
              updatedBy: dto.operatedBy?.trim() || null,
            }),
          );
        }
        reversal.entries = await manager.save(reversalEntries);

        notice.status = PurchaseReceiveNoticeStatus.REVERSED;
        notice.reversalId = reversal.id;
        notice.reversalNo = reversal.reversalNo;
        notice.reversedAt = reversalDate;
        notice.reversedBy = dto.operatedBy?.trim() || null;
        notice.updatedBy = dto.operatedBy?.trim() || notice.updatedBy;
        await manager.save(notice);

        return this.presentReversal(reversal);
      });
    } catch (error) {
      if (this.isReversalUniqueViolation(error)) {
        const concurrent = await this.findReversalByIdempotencyKey(dto.idempotencyKey);
        if (concurrent) return this.assertIdempotentReversal(concurrent, id, dto);
        const sourceReversal = await this.dataSource.getRepository(PurchaseReceiveNoticeReversal).findOne({
          where: { sourceNoticeId: id, isDeleted: 0 },
          relations: { entries: true },
        });
        if (sourceReversal) throw new BadRequestException('收料通知已被其他请求冲销');
      }
      throw error;
    }
  }

  async reject(id: string) {
    return this.changeStatus(
      id,
      [PurchaseReceiveNoticeStatus.SUBMITTED],
      PurchaseReceiveNoticeStatus.REJECTED,
      '只有待审核收料通知允许驳回',
    );
  }

  async cancel(id: string) {
    return this.changeStatus(
      id,
      [PurchaseReceiveNoticeStatus.DRAFT, PurchaseReceiveNoticeStatus.SUBMITTED],
      PurchaseReceiveNoticeStatus.CANCELED,
      '只有草稿或待审核收料通知允许取消；P0 不支持已审核反审核',
    );
  }

  async close(id: string) {
    return this.changeStatus(
      id,
      [PurchaseReceiveNoticeStatus.APPROVED],
      PurchaseReceiveNoticeStatus.CLOSED,
      '只有已审核收料通知允许关闭',
    );
  }

  private async changeStatus(
    id: string,
    from: PurchaseReceiveNoticeStatus[],
    to: PurchaseReceiveNoticeStatus,
    message: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const notice = await this.findEntityById(id, manager, true);
      if (!notice) throw new NotFoundException('收料通知不存在');
      if (!from.includes(notice.status)) throw new BadRequestException(message);
      notice.status = to;
      await manager.save(notice);
      return this.present(notice);
    });
  }
}
