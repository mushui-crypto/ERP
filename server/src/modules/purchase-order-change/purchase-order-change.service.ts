import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { PurchaseOrderChangeEntry } from '../../database/entities/purchase-order-change-entry.entity';
import { PurchaseOrderChange } from '../../database/entities/purchase-order-change.entity';
import { PurchaseOrderEntry } from '../../database/entities/purchase-order-entry.entity';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';
import { PurchaseOrderStatus, generateDocumentNo, withStatusMeta } from '../purchase-common/purchase-status';
import { PurchaseOrderService } from '../purchase-order/purchase-order.service';
import {
  CreatePurchaseOrderChangeDto,
  OperatePurchaseOrderChangeDto,
  PurchaseOrderChangeLineDto,
  UpdatePurchaseOrderChangeDto,
} from './dto/purchase-order-change.dto';
import {
  PURCHASE_ORDER_CHANGE_STATUS_META,
  PurchaseOrderChangeEffectiveStatus,
  PurchaseOrderChangeStatus,
} from './purchase-order-change.status';

@Injectable()
export class PurchaseOrderChangeService {
  constructor(
    @InjectRepository(PurchaseOrderChange)
    private readonly repository: Repository<PurchaseOrderChange>,
    @InjectRepository(PurchaseOrderChangeEntry)
    private readonly entryRepository: Repository<PurchaseOrderChangeEntry>,
    private readonly purchaseOrderService: PurchaseOrderService,
    private readonly dataSource: DataSource,
  ) {}

  private round(value: number, digits: number) {
    return Number(Number(value || 0).toFixed(digits));
  }

  private present(entity: PurchaseOrderChange) {
    const value = withStatusMeta({
      ...entity,
      entries: (entity.entries || []).filter((entry) => entry.isDeleted === 0).map((entry) => ({
        ...entry,
        snapshotReceivedQty: Number(entry.snapshotReceivedQty || 0),
        snapshotStockedQty: Number(entry.snapshotStockedQty || 0),
        snapshotReturnedQty: Number(entry.snapshotReturnedQty || 0),
        oldOrderQty: Number(entry.oldOrderQty),
        newOrderQty: Number(entry.newOrderQty),
        oldUnitPrice: Number(entry.oldUnitPrice),
        newUnitPrice: Number(entry.newUnitPrice),
        taxRate: Number(entry.taxRate || 0),
      })),
    }, PURCHASE_ORDER_CHANGE_STATUS_META);
    const actions: string[] = [];
    if ([PurchaseOrderChangeStatus.DRAFT, PurchaseOrderChangeStatus.REJECTED].includes(entity.status)) actions.push('UPDATE', 'SUBMIT', 'CANCEL');
    if (entity.status === PurchaseOrderChangeStatus.SUBMITTED) actions.push('APPROVE', 'REJECT', 'CANCEL');
    return { ...value, availableActions: actions };
  }

  private async findEntityById(id: string, manager?: EntityManager, lock = false) {
    const repository = manager ? manager.getRepository(PurchaseOrderChange) : this.repository;
    return repository.findOne({
      where: { id, isDeleted: 0 },
      relations: { entries: true },
      order: { entries: { lineNo: 'ASC' } },
      ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}),
    });
  }

  async findAll(page = 1, pageSize = 20, status?: number, orderNo?: string, supplierId?: string) {
    const query = this.repository.createQueryBuilder('header')
      .leftJoinAndSelect('header.entries', 'entry', 'entry.isDeleted = 0')
      .where('header.isDeleted = 0');
    if (status !== undefined) query.andWhere('header.status = :status', { status });
    if (orderNo) query.andWhere('header.sourceOrderNo LIKE :orderNo', { orderNo: `%${orderNo}%` });
    if (supplierId) query.andWhere('header.supplierId = :supplierId', { supplierId });
    const [list, total] = await query.orderBy('header.createdAt', 'DESC').addOrderBy('entry.lineNo', 'ASC')
      .skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { list: list.map((item) => this.present(item)), total, page, pageSize };
  }

  async findById(id: string) {
    const entity = await this.findEntityById(id);
    if (!entity) throw new NotFoundException('采购订单变更单不存在');
    return this.present(entity);
  }

  async findByOrder(orderId: string) {
    const list = await this.repository.find({
      where: { sourceOrderId: orderId, isDeleted: 0 },
      relations: { entries: true },
      order: { createdAt: 'DESC', entries: { lineNo: 'ASC' } },
    });
    return list.map((item) => this.present(item));
  }

  private payloadHash(dto: CreatePurchaseOrderChangeDto) {
    const normalized = {
      orderId: dto.orderId,
      changeDate: dto.changeDate || null,
      changeReason: dto.changeReason.trim(),
      remark: dto.remark || null,
      entries: [...dto.entries].sort((left, right) => left.orderEntryId.localeCompare(right.orderEntryId)).map((line) => ({
        orderEntryId: line.orderEntryId,
        newOrderQty: line.newOrderQty === undefined ? null : this.round(line.newOrderQty, 4),
        newUnitPrice: line.newUnitPrice === undefined ? null : this.round(line.newUnitPrice, 4),
        newDeliveryDate: line.newDeliveryDate || null,
        newWarehouseId: line.newWarehouseId || null,
        newRemark: line.newRemark === undefined ? null : line.newRemark,
      })),
    };
    return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
  }

  private async assertIdempotent(existing: PurchaseOrderChange, hash: string) {
    if (existing.payloadHash !== hash) throw new ConflictException('相同幂等键对应的采购订单变更载荷不一致');
    const loaded = await this.findEntityById(existing.id);
    return this.present(loaded || existing);
  }

  private datesEqual(left?: Date, right?: Date) {
    return (left ? new Date(left).getTime() : 0) === (right ? new Date(right).getTime() : 0);
  }

  private resolveEntries(order: PurchaseOrder, lines: PurchaseOrderChangeLineDto[]) {
    if (new Set(lines.map((line) => line.orderEntryId)).size !== lines.length) {
      throw new BadRequestException('采购订单变更来源明细不能重复');
    }
    const sourceById = new Map((order.entries || []).filter((entry) => entry.isDeleted === 0).map((entry) => [entry.id, entry]));
    return lines.map((line, index) => {
      const source = sourceById.get(line.orderEntryId);
      if (!source) throw new BadRequestException(`采购订单明细不存在: ${line.orderEntryId}`);
      const newOrderQty = this.round(line.newOrderQty === undefined ? Number(source.orderQty) : Number(line.newOrderQty), 4);
      const newUnitPrice = this.round(line.newUnitPrice === undefined ? Number(source.unitPrice) : Number(line.newUnitPrice), 4);
      const newDeliveryDate = line.newDeliveryDate === undefined ? source.deliveryDate : new Date(line.newDeliveryDate);
      const newWarehouseId = line.newWarehouseId === undefined ? source.warehouseId : line.newWarehouseId;
      const newRemark = line.newRemark === undefined ? source.remark : line.newRemark;
      const changes: string[] = [];
      if (Math.abs(newOrderQty - Number(source.orderQty)) > 0.000001) changes.push('QUANTITY');
      if (Math.abs(newUnitPrice - Number(source.unitPrice)) > 0.000001) changes.push('PRICE');
      if (!this.datesEqual(newDeliveryDate, source.deliveryDate)) changes.push('DELIVERY_DATE');
      if ((newWarehouseId || '') !== (source.warehouseId || '')) changes.push('WAREHOUSE');
      if ((newRemark || '') !== (source.remark || '')) changes.push('REMARK');
      if (!changes.length) throw new BadRequestException(`采购订单第${source.lineNo}行没有实际变更`);
      const executedQty = Math.max(Number(source.receivedQty || 0), Number(source.stockedQty || 0));
      if (newOrderQty + 0.000001 < executedQty) {
        throw new BadRequestException(`采购订单第${source.lineNo}行新数量不得小于已收料/已入库数量 ${executedQty}`);
      }
      return {
        lineNo: index + 1,
        sourceOrderId: order.id,
        sourceOrderNo: order.orderNo,
        sourceOrderEntryId: source.id,
        sourceRequestId: source.sourceRequestId,
        sourceRequestEntryId: source.sourceRequestEntryId,
        expenseItemCode: source.expenseItemCode,
        expenseItemName: source.expenseItemName,
        materialId: source.materialId,
        materialCode: source.materialCode,
        materialName: source.materialName,
        materialModel: source.materialModel,
        unitId: source.unitId,
        unitCode: source.unitCode,
        unitName: source.unitName,
        snapshotReceivedQty: Number(source.receivedQty || 0),
        snapshotStockedQty: Number(source.stockedQty || 0),
        snapshotReturnedQty: Number(source.returnedQty || 0),
        oldOrderQty: Number(source.orderQty),
        newOrderQty,
        oldUnitPrice: Number(source.unitPrice),
        newUnitPrice,
        taxRate: Number(source.taxRate || 0),
        oldDeliveryDate: source.deliveryDate,
        newDeliveryDate,
        oldWarehouseId: source.warehouseId,
        newWarehouseId,
        oldRemark: source.remark,
        newRemark,
        changeType: changes.join(','),
      };
    });
  }

  async createFromOrder(dto: CreatePurchaseOrderChangeDto) {
    const hash = this.payloadHash(dto);
    const existing = await this.repository.findOne({ where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 } });
    if (existing) return this.assertIdempotent(existing, hash);
    try {
      return await this.dataSource.transaction(async (manager) => {
        const retry = await manager.findOne(PurchaseOrderChange, {
          where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 },
          lock: { mode: 'pessimistic_write' },
        });
        if (retry) return this.assertIdempotent(retry, hash);
        const order = await this.purchaseOrderService.findEntityById(dto.orderId, manager, true);
        if (!order) throw new NotFoundException('采购订单不存在');
        if (order.status !== PurchaseOrderStatus.APPROVED) {
          throw new BadRequestException('只有已审核且未完成、未关闭的采购订单允许创建变更单');
        }
        const active = await manager.findOne(PurchaseOrderChange, { where: { activeOrderKey: order.id, isDeleted: 0 } });
        if (active) throw new ConflictException(`采购订单 ${order.orderNo} 已存在有效未生效变更单 ${active.changeNo}`);
        const resolved = this.resolveEntries(order, dto.entries);
        const header = manager.create(PurchaseOrderChange, {
          changeNo: generateDocumentNo('POC'),
          idempotencyKey: dto.idempotencyKey,
          payloadHash: hash,
          activeOrderKey: order.id,
          sourceOrderId: order.id,
          sourceOrderNo: order.orderNo,
          purchaseOrgId: order.purchaseOrgId,
          supplierId: order.supplierId,
          currencyId: order.currencyId,
          billType: order.billType,
          businessType: order.businessType,
          changeDate: dto.changeDate ? new Date(dto.changeDate) : new Date(),
          changeReason: dto.changeReason.trim(),
          remark: dto.remark || null,
          status: PurchaseOrderChangeStatus.DRAFT,
          effectiveStatus: PurchaseOrderChangeEffectiveStatus.NOT_EFFECTIVE,
        });
        const saved = await manager.save(header);
        saved.entries = await manager.save(resolved.map((line) => manager.create(PurchaseOrderChangeEntry, {
          ...line,
          purchaseOrderChangeId: saved.id,
        })));
        return this.present(saved);
      });
    } catch (error) {
      const concurrent = await this.repository.findOne({ where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 } });
      if (concurrent) return this.assertIdempotent(concurrent, hash);
      throw error;
    }
  }

  async update(id: string, dto: UpdatePurchaseOrderChangeDto) {
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntityById(id, manager, true);
      if (!entity) throw new NotFoundException('采购订单变更单不存在');
      if (![PurchaseOrderChangeStatus.DRAFT, PurchaseOrderChangeStatus.REJECTED].includes(entity.status)) {
        throw new BadRequestException('只有草稿或已驳回采购订单变更单允许修改');
      }
      if (dto.changeDate) entity.changeDate = new Date(dto.changeDate);
      if (dto.changeReason !== undefined) entity.changeReason = dto.changeReason.trim();
      if (dto.remark !== undefined) entity.remark = dto.remark;
      if (dto.entries) {
        const order = await this.purchaseOrderService.findEntityById(entity.sourceOrderId, manager, true);
        if (!order || order.status !== PurchaseOrderStatus.APPROVED) throw new BadRequestException('来源采购订单当前不允许变更');
        const resolved = this.resolveEntries(order, dto.entries);
        await manager.delete(PurchaseOrderChangeEntry, { purchaseOrderChangeId: entity.id });
        entity.entries = await manager.save(resolved.map((line) => manager.create(PurchaseOrderChangeEntry, {
          ...line,
          purchaseOrderChangeId: entity.id,
        })));
      }
      await manager.save(entity);
      return this.present(entity);
    });
  }

  async submit(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntityById(id, manager, true);
      if (!entity) throw new NotFoundException('采购订单变更单不存在');
      if (entity.status === PurchaseOrderChangeStatus.SUBMITTED) return this.present(entity);
      if (![PurchaseOrderChangeStatus.DRAFT, PurchaseOrderChangeStatus.REJECTED].includes(entity.status)) {
        throw new BadRequestException('只有草稿或已驳回采购订单变更单允许提交');
      }
      if (!entity.entries?.length || !entity.changeReason) throw new BadRequestException('采购订单变更原因和明细不能为空');
      entity.status = PurchaseOrderChangeStatus.SUBMITTED;
      entity.rejectedAt = null;
      entity.rejectedBy = null;
      entity.rejectReason = null;
      await manager.save(entity);
      return this.present(entity);
    });
  }

  async approve(id: string, dto: OperatePurchaseOrderChangeDto) {
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntityById(id, manager, true);
      if (!entity) throw new NotFoundException('采购订单变更单不存在');
      if (entity.status === PurchaseOrderChangeStatus.APPROVED) return this.present(entity);
      if (entity.status !== PurchaseOrderChangeStatus.SUBMITTED) throw new BadRequestException('只有待审核采购订单变更单允许审核');
      await this.purchaseOrderService.applyApprovedChange(entity.sourceOrderId, entity.entries.map((entry) => ({
        sourceOrderEntryId: entry.sourceOrderEntryId,
        sourceRequestEntryId: entry.sourceRequestEntryId,
        oldOrderQty: Number(entry.oldOrderQty),
        newOrderQty: Number(entry.newOrderQty),
        oldUnitPrice: Number(entry.oldUnitPrice),
        newUnitPrice: Number(entry.newUnitPrice),
        oldDeliveryDate: entry.oldDeliveryDate,
        newDeliveryDate: entry.newDeliveryDate,
        oldWarehouseId: entry.oldWarehouseId,
        newWarehouseId: entry.newWarehouseId,
        oldRemark: entry.oldRemark,
        newRemark: entry.newRemark,
      })), manager, dto.operatedBy);
      const now = new Date();
      entity.status = PurchaseOrderChangeStatus.APPROVED;
      entity.effectiveStatus = PurchaseOrderChangeEffectiveStatus.EFFECTIVE;
      entity.approvedAt = now;
      entity.approvedBy = dto.operatedBy || null;
      entity.effectiveAt = now;
      entity.effectiveBy = dto.operatedBy || null;
      entity.activeOrderKey = null;
      entity.updatedBy = dto.operatedBy || null;
      await manager.save(entity);
      return this.present(entity);
    });
  }

  async reject(id: string, dto: OperatePurchaseOrderChangeDto) {
    if (!dto.reason) throw new BadRequestException('驳回原因不能为空');
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntityById(id, manager, true);
      if (!entity) throw new NotFoundException('采购订单变更单不存在');
      if (entity.status !== PurchaseOrderChangeStatus.SUBMITTED) throw new BadRequestException('只有待审核采购订单变更单允许驳回');
      entity.status = PurchaseOrderChangeStatus.REJECTED;
      entity.rejectedAt = new Date();
      entity.rejectedBy = dto.operatedBy || null;
      entity.rejectReason = dto.reason;
      await manager.save(entity);
      return this.present(entity);
    });
  }

  async cancel(id: string, dto: OperatePurchaseOrderChangeDto) {
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntityById(id, manager, true);
      if (!entity) throw new NotFoundException('采购订单变更单不存在');
      if (entity.status === PurchaseOrderChangeStatus.CANCELED) return this.present(entity);
      if (![PurchaseOrderChangeStatus.DRAFT, PurchaseOrderChangeStatus.SUBMITTED, PurchaseOrderChangeStatus.REJECTED].includes(entity.status)) {
        throw new BadRequestException('只有未生效采购订单变更单允许取消');
      }
      entity.status = PurchaseOrderChangeStatus.CANCELED;
      entity.activeOrderKey = null;
      entity.canceledAt = new Date();
      entity.canceledBy = dto.operatedBy || null;
      entity.cancelReason = dto.reason || null;
      await manager.save(entity);
      return this.present(entity);
    });
  }
}
