import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { DataSource, EntityManager, In, Repository } from 'typeorm';
import { InventoryInEntry } from '../../database/entities/inventory-in-entry.entity';
import { InventoryIn } from '../../database/entities/inventory-in.entity';
import { PurchaseOrderEntry } from '../../database/entities/purchase-order-entry.entity';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';
import { PurchaseReceiveNoticeEntry } from '../../database/entities/purchase-receive-notice-entry.entity';
import { PurchaseReceiveNotice } from '../../database/entities/purchase-receive-notice.entity';
import { PurchaseReturnEntry } from '../../database/entities/purchase-return-entry.entity';
import { Supplier } from '../../database/entities/supplier.entity';
import { Warehouse } from '../../database/entities/warehouse.entity';
import { InventoryService } from '../inventory/inventory.service';
import { PayableService } from '../payable/payable.service';
import {
  generateDocumentNo,
  PurchaseOrderStatus,
  PurchaseReceiveNoticeStatus,
} from '../purchase-common/purchase-status';
import {
  ApproveInventoryInDto,
  CreateInventoryInDto,
  PushReceiveNoticesToInventoryInDto,
  UpdateInventoryInDto,
  UpdatePurchaseInventoryInDto,
} from './dto/inventory-in.dto';
import {
  InventoryInStatus,
  InventoryInType,
  PayableGenerationStatus,
  withInventoryInStatus,
} from './inventory-in.status';

const QUANTITY_EPSILON = 0.000001;
const ACTIVE_PURCHASE_OCCUPATION_STATUSES = [
  InventoryInStatus.DRAFT,
  InventoryInStatus.SUBMITTED,
  InventoryInStatus.REJECTED,
];

interface InventoryInQuery {
  page: number;
  pageSize: number;
  inNo?: string;
  materialCode?: string;
  inType?: number;
  supplierId?: string;
  status?: number;
}

@Injectable()
export class InventoryInService {
  constructor(
    @InjectRepository(InventoryIn)
    private readonly inventoryInRepository: Repository<InventoryIn>,
    @InjectRepository(InventoryInEntry)
    private readonly inventoryInEntryRepository: Repository<InventoryInEntry>,
    private readonly dataSource: DataSource,
    private readonly inventoryService: InventoryService,
    private readonly payableService: PayableService,
  ) {}

  private present(inventoryIn: InventoryIn) {
    const entries = (inventoryIn.entries || []).map((entry) => ({
      ...entry,
      quantity: Number(entry.quantity),
      unitPrice: Number(entry.unitPrice),
      taxRate: Number(entry.taxRate || 0),
      amount: Number(entry.amount || 0),
      taxAmount: Number(entry.taxAmount || 0),
      totalAmount: Number(entry.totalAmount || 0),
      returnedQty: Number(entry.returnedQty || 0),
      availableReturnQty: Math.max(0, Number(entry.quantity || 0) - Number(entry.returnedQty || 0)),
    }));
    return withInventoryInStatus({
      ...inventoryIn,
      amount: Number(inventoryIn.amount || 0),
      taxAmount: Number(inventoryIn.taxAmount || 0),
      totalAmount: Number(inventoryIn.totalAmount || 0),
      entries,
    });
  }

  async findAll(
    page = 1,
    pageSize = 20,
    inNo?: string,
    materialCode?: string,
    inType?: number,
    supplierId?: string,
    status?: number,
  ) {
    const query = this.inventoryInRepository.createQueryBuilder('inventoryIn')
      .leftJoinAndSelect('inventoryIn.entries', 'entry', 'entry.isDeleted = 0')
      .where('inventoryIn.isDeleted = 0')
      .distinct(true);

    if (inNo) query.andWhere('inventoryIn.inNo LIKE :inNo', { inNo: `%${inNo}%` });
    if (materialCode) {
      query.andWhere('(inventoryIn.materialCode LIKE :materialCode OR entry.materialCode LIKE :materialCode)', {
        materialCode: `%${materialCode}%`,
      });
    }
    if (inType !== undefined) query.andWhere('inventoryIn.inType = :inType', { inType });
    if (supplierId) query.andWhere('inventoryIn.supplierId = :supplierId', { supplierId });
    if (status !== undefined) query.andWhere('inventoryIn.status = :status', { status });

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('inventoryIn.createdAt', 'DESC')
      .getManyAndCount();

    return { list: list.map((item) => this.present(item)), total, page, pageSize };
  }

  async findById(id: string) {
    const entity = await this.inventoryInRepository.findOne({
      where: { id, isDeleted: 0 },
      relations: { entries: true },
    });
    return entity ? this.present(entity) : null;
  }

  /** 兼容既有非采购单行入库；标准采购入库只能由已审核收料通知下推。 */
  async create(dto: CreateInventoryInDto) {
    if (Number(dto.inType) === InventoryInType.PURCHASE) {
      throw new BadRequestException('标准采购入库必须通过 POST /inventory-in/from-receive-notices 创建');
    }
    const amount = this.round(
      dto.amount === undefined ? Number(dto.unitPrice || 0) * Number(dto.quantity || 0) : Number(dto.amount),
      2,
    );
    const entity = this.inventoryInRepository.create({
      ...dto,
      inNo: generateDocumentNo('IN'),
      status: InventoryInStatus.DRAFT,
      inDate: dto.inDate || new Date(),
      amount,
      taxAmount: 0,
      totalAmount: amount,
      payableGenerationStatus: PayableGenerationStatus.NOT_GENERATED,
    });
    return this.present(await this.inventoryInRepository.save(entity));
  }

  async createFromReceiveNotices(dto: PushReceiveNoticesToInventoryInDto) {
    if ((dto.businessType || 'STANDARD') !== 'STANDARD') {
      throw new BadRequestException('当前接口只支持标准采购业务类型 STANDARD');
    }
    this.assertUnique(dto.entries.map((entry) => entry.sourceReceiveNoticeEntryId), '来源收料通知明细不能重复');
    const payloadHash = this.calculatePushPayloadHash(dto);

    const existing = await this.inventoryInRepository.findOne({
      where: { pushIdempotencyKey: dto.idempotencyKey, isDeleted: 0 },
      relations: { entries: true },
    });
    if (existing) return this.assertIdempotentPayload(existing, payloadHash);

    return this.dataSource.transaction(async (manager) => {
      const concurrentExisting = await manager.findOne(InventoryIn, {
        where: { pushIdempotencyKey: dto.idempotencyKey, isDeleted: 0 },
        relations: { entries: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (concurrentExisting) return this.assertIdempotentPayload(concurrentExisting, payloadHash);

      const sourceIds = [...dto.entries.map((entry) => entry.sourceReceiveNoticeEntryId)].sort();
      const sourceEntries = await manager.getRepository(PurchaseReceiveNoticeEntry)
        .createQueryBuilder('sourceEntry')
        .innerJoinAndSelect('sourceEntry.purchaseReceiveNotice', 'notice')
        .where('sourceEntry.id IN (:...sourceIds)', { sourceIds })
        .andWhere('sourceEntry.isDeleted = 0')
        .andWhere('notice.isDeleted = 0')
        .orderBy('sourceEntry.id', 'ASC')
        .setLock('pessimistic_write')
        .getMany();
      if (sourceEntries.length !== sourceIds.length) throw new BadRequestException('存在无效或已删除的收料通知明细');

      // 同一来源明细下推会锁定同一行；锁后再次检查幂等键，覆盖并发首创场景。
      const existingAfterSourceLock = await manager.findOne(InventoryIn, {
        where: { pushIdempotencyKey: dto.idempotencyKey, isDeleted: 0 },
        relations: { entries: true },
      });
      if (existingAfterSourceLock) return this.assertIdempotentPayload(existingAfterSourceLock, payloadHash);

      const sourceById = new Map(sourceEntries.map((entry) => [entry.id, entry]));
      const notices = sourceEntries.map((entry) => entry.purchaseReceiveNotice);
      for (const notice of notices) {
        if (notice.status !== PurchaseReceiveNoticeStatus.APPROVED) {
          throw new BadRequestException(`收料通知 ${notice.noticeNo} 不是已审核状态，不能下推采购入库`);
        }
      }
      this.assertSameValue(notices.map((notice) => notice.sourceType || 'PURCHASE_ORDER'), '禁止混合普通收料与退料补料收料下推采购入库');
      const isReturnReplenish = notices[0].sourceType === 'PURCHASE_RETURN_REPLENISH';

      const purchaseOrderIds = new Set(sourceEntries.map((entry) => entry.sourceOrderId));
      if (purchaseOrderIds.size !== 1) throw new BadRequestException('P0 仅允许合并同一采购订单的多张收料通知');
      const purchaseOrderId = [...purchaseOrderIds][0];
      const order = await manager.findOne(PurchaseOrder, {
        where: { id: purchaseOrderId, isDeleted: 0 },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) throw new BadRequestException('来源采购订单不存在');
      const allowedOrderStatuses = isReturnReplenish
        ? [PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.FULLY_STOCKED]
        : [PurchaseOrderStatus.APPROVED];
      if (!allowedOrderStatuses.includes(order.status)) {
        throw new BadRequestException(`采购订单 ${order.orderNo} 当前状态不允许下推采购入库`);
      }
      if (!order.currencyId) throw new BadRequestException(`采购订单 ${order.orderNo} 缺少币种，不能下推采购入库`);
      if (!order.paymentTermId) throw new BadRequestException(`采购订单 ${order.orderNo} 缺少付款条件，不能下推采购入库`);

      this.assertSameValue(notices.map((notice) => notice.stockOrgId), '禁止跨收料/库存组织合并下推');
      this.assertSameValue(notices.map((notice) => notice.purchaseOrgId), '禁止跨采购组织合并下推');
      this.assertSameValue(notices.map((notice) => notice.supplierId), '禁止跨供应商合并下推');
      this.assertSameValue(notices.map((notice) => notice.businessType || 'STANDARD'), '禁止混合不同采购业务类型下推采购入库');
      const businessType = notices[0].businessType || 'STANDARD';
      if (businessType === 'ASSET_NO_INBOUND') throw new BadRequestException('资产采购不入库流程禁止生成采购入库单');
      if (!['STANDARD', 'ASSET_INBOUND'].includes(businessType)) throw new BadRequestException('当前采购业务类型不允许生成采购入库单');
      if (notices.some((notice) => notice.purchaseOrderId !== order.id || notice.supplierId !== order.supplierId)) {
        throw new BadRequestException('收料通知与采购订单的来源或供应商不一致');
      }

      const orderEntryIds = [...new Set(sourceEntries.map((entry) => entry.sourceOrderEntryId))].sort();
      const orderEntries = await manager.getRepository(PurchaseOrderEntry)
        .createQueryBuilder('orderEntry')
        .where('orderEntry.id IN (:...orderEntryIds)', { orderEntryIds })
        .andWhere('orderEntry.purchaseOrderId = :purchaseOrderId', { purchaseOrderId: order.id })
        .andWhere('orderEntry.isDeleted = 0')
        .orderBy('orderEntry.id', 'ASC')
        .setLock('pessimistic_write')
        .getMany();
      if (orderEntries.length !== orderEntryIds.length) throw new BadRequestException('存在无效的来源采购订单明细');
      const orderEntryById = new Map(orderEntries.map((entry) => [entry.id, entry]));

      const supplier = await manager.findOne(Supplier, { where: { id: order.supplierId, isDeleted: 0 } });
      if (!supplier) throw new BadRequestException('采购订单供应商不存在');

      const warehouseIds = [...new Set(dto.entries.map((entry) => entry.warehouseId))];
      const warehouses = await manager.find(Warehouse, { where: { id: In(warehouseIds), isDeleted: 0, status: 1 } });
      if (warehouses.length !== warehouseIds.length) throw new BadRequestException('存在无效或未启用的入库仓库');
      const warehouseById = new Map(warehouses.map((warehouse) => [warehouse.id, warehouse]));

      const header = manager.create(InventoryIn, {
        inNo: generateDocumentNo('PIN'),
        pushIdempotencyKey: dto.idempotencyKey,
        pushPayloadHash: payloadHash,
        orgId: notices[0].stockOrgId,
        stockOrgId: notices[0].stockOrgId,
        purchaseOrgId: notices[0].purchaseOrgId,
        settleOrgId: dto.settleOrgId,
        ownerType: dto.ownerType,
        ownerId: dto.ownerId,
        businessType,
        inType: InventoryInType.PURCHASE,
        sourceType: isReturnReplenish ? 'PURCHASE_RETURN_REPLENISH' : 'PURCHASE_RECEIVE_NOTICE',
        supplierId: supplier.id,
        supplierCode: supplier.supplierCode,
        supplierName: supplier.supplierName,
        currencyId: order.currencyId,
        paymentTermId: order.paymentTermId,
        inDate: dto.inDate ? new Date(dto.inDate) : new Date(),
        status: InventoryInStatus.DRAFT,
        payableGenerationStatus: isReturnReplenish
          ? PayableGenerationStatus.NOT_REQUIRED
          : PayableGenerationStatus.NOT_GENERATED,
        amount: 0,
        taxAmount: 0,
        totalAmount: 0,
        remark: dto.remark || null,
      });
      await manager.save(header);

      const createdEntries: InventoryInEntry[] = [];
      for (let index = 0; index < dto.entries.length; index += 1) {
        const input = dto.entries[index];
        const source = sourceById.get(input.sourceReceiveNoticeEntryId);
        const orderEntry = source && orderEntryById.get(source.sourceOrderEntryId);
        if (!source || !orderEntry) throw new BadRequestException('来源收料或采购订单明细不存在');
        await this.assertSourceAvailable(source, Number(input.quantity), manager);
        const warehouse = warehouseById.get(input.warehouseId);
        const money = this.calculateLine(Number(input.quantity), Number(orderEntry.unitPrice), Number(orderEntry.taxRate || 0));
        const created = manager.create(InventoryInEntry, {
          inventoryInId: header.id,
          lineNo: index + 1,
          warehouseId: warehouse.id,
          warehouseCode: warehouse.warehouseCode,
          warehouseName: warehouse.warehouseName,
          materialId: source.materialId,
          materialCode: source.materialCode,
          materialName: source.materialName,
          materialModel: source.materialModel,
          unitId: source.unitId,
          unitCode: source.unitCode,
          unitName: source.unitName,
          quantity: money.quantity,
          unitPrice: money.unitPrice,
          taxRate: money.taxRate,
          amount: money.amount,
          taxAmount: money.taxAmount,
          totalAmount: money.totalAmount,
          lotNo: input.lotNo ?? source.supplierLot,
          produceDate: input.produceDate ? new Date(input.produceDate) : source.produceDate,
          expiryDate: input.expiryDate ? new Date(input.expiryDate) : source.expiryDate,
          location: input.location || null,
          sourceReceiveNoticeId: source.purchaseReceiveNoticeId,
          sourceReceiveNoticeNo: source.purchaseReceiveNotice.noticeNo,
          sourceReceiveNoticeEntryId: source.id,
          sourceOrderId: source.sourceOrderId,
          sourceOrderNo: source.sourceOrderNo,
          sourceOrderEntryId: source.sourceOrderEntryId,
          sourceRequestId: source.sourceRequestId,
          sourceRequestNo: source.sourceRequestNo,
          sourceRequestEntryId: source.sourceRequestEntryId,
          sourcePurchaseReturnEntryId: source.sourcePurchaseReturnEntryId,
          returnedQty: 0,
          assetAcceptedQty: 0,
          remark: input.remark || null,
        });
        createdEntries.push(await manager.save(created));
      }

      header.entries = createdEntries;
      this.applyHeaderTotalsAndCompatibility(header, createdEntries);
      const noticeIds = [...new Set(createdEntries.map((entry) => entry.sourceReceiveNoticeId))];
      if (noticeIds.length === 1) {
        header.sourceId = noticeIds[0];
        header.sourceNo = createdEntries[0].sourceReceiveNoticeNo;
      }
      await manager.save(header);
      return this.present(header);
    });
  }

  async update(id: string, dto: UpdateInventoryInDto) {
    const inventoryIn = await this.inventoryInRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!inventoryIn) throw new NotFoundException('入库单不存在');
    if (inventoryIn.inType === InventoryInType.PURCHASE) {
      throw new BadRequestException('采购入库请使用 PUT /inventory-in/:id/purchase-draft 修改');
    }
    if (![InventoryInStatus.DRAFT, InventoryInStatus.REJECTED].includes(inventoryIn.status)) {
      throw new BadRequestException('只有草稿或已驳回入库单允许修改');
    }

    Object.assign(inventoryIn, dto);
    if (dto.unitPrice !== undefined || dto.quantity !== undefined) {
      inventoryIn.amount = this.round(Number(inventoryIn.unitPrice || 0) * Number(inventoryIn.quantity || 0), 2);
      inventoryIn.totalAmount = inventoryIn.amount;
    }
    return this.present(await this.inventoryInRepository.save(inventoryIn));
  }

  async updatePurchaseDraft(id: string, dto: UpdatePurchaseInventoryInDto) {
    this.assertUnique(dto.entries.map((entry) => entry.id), '采购入库明细ID不能重复');
    return this.dataSource.transaction(async (manager) => {
      const inventoryIn = await this.findEntityById(id, manager, true);
      if (!inventoryIn) throw new NotFoundException('采购入库单不存在');
      if (inventoryIn.inType !== InventoryInType.PURCHASE) throw new BadRequestException('该单据不是采购入库单');
      if (![InventoryInStatus.DRAFT, InventoryInStatus.REJECTED].includes(inventoryIn.status)) {
        throw new BadRequestException('只有草稿或已驳回采购入库单允许修改');
      }
      const currentEntries = inventoryIn.entries.filter((entry) => entry.isDeleted === 0);
      if (currentEntries.length !== dto.entries.length) throw new BadRequestException('P0 不允许新增或删除采购入库来源明细');
      const currentById = new Map(currentEntries.map((entry) => [entry.id, entry]));
      if (dto.entries.some((entry) => !currentById.has(entry.id))) throw new BadRequestException('存在不属于当前采购入库单的明细');

      const warehouseIds = [...new Set(dto.entries.map((entry) => entry.warehouseId))];
      const warehouses = await manager.find(Warehouse, { where: { id: In(warehouseIds), isDeleted: 0, status: 1 } });
      if (warehouses.length !== warehouseIds.length) throw new BadRequestException('存在无效或未启用的入库仓库');
      const warehouseById = new Map(warehouses.map((warehouse) => [warehouse.id, warehouse]));

      const sourceIds = currentEntries.map((entry) => entry.sourceReceiveNoticeEntryId).sort();
      const sources = await manager.getRepository(PurchaseReceiveNoticeEntry)
        .createQueryBuilder('source')
        .innerJoinAndSelect('source.purchaseReceiveNotice', 'notice')
        .where('source.id IN (:...sourceIds)', { sourceIds })
        .andWhere('source.isDeleted = 0')
        .orderBy('source.id', 'ASC')
        .setLock('pessimistic_write')
        .getMany();
      if (sources.length !== sourceIds.length) throw new BadRequestException('采购入库来源收料明细不存在');
      const sourceById = new Map(sources.map((source) => [source.id, source]));

      for (const input of dto.entries) {
        const entry = currentById.get(input.id);
        const source = sourceById.get(entry.sourceReceiveNoticeEntryId);
        if (!source || source.purchaseReceiveNotice.status !== PurchaseReceiveNoticeStatus.APPROVED) {
          throw new BadRequestException(`来源收料通知 ${entry.sourceReceiveNoticeNo} 当前状态不允许修改采购入库`);
        }
        await this.assertSourceAvailable(source, Number(input.quantity), manager, inventoryIn.id);
        const warehouse = warehouseById.get(input.warehouseId);
        const money = this.calculateLine(Number(input.quantity), Number(entry.unitPrice), Number(entry.taxRate || 0));
        Object.assign(entry, {
          warehouseId: warehouse.id,
          warehouseCode: warehouse.warehouseCode,
          warehouseName: warehouse.warehouseName,
          quantity: money.quantity,
          amount: money.amount,
          taxAmount: money.taxAmount,
          totalAmount: money.totalAmount,
          lotNo: input.lotNo ?? entry.lotNo,
          produceDate: input.produceDate ? new Date(input.produceDate) : entry.produceDate,
          expiryDate: input.expiryDate ? new Date(input.expiryDate) : entry.expiryDate,
          location: input.location ?? entry.location,
          remark: input.remark ?? entry.remark,
        });
        await manager.save(entry);
      }

      if (dto.inDate) inventoryIn.inDate = new Date(dto.inDate);
      if (dto.settleOrgId !== undefined) inventoryIn.settleOrgId = dto.settleOrgId;
      if (dto.ownerType !== undefined) inventoryIn.ownerType = dto.ownerType;
      if (dto.ownerId !== undefined) inventoryIn.ownerId = dto.ownerId;
      if (dto.remark !== undefined) inventoryIn.remark = dto.remark;
      inventoryIn.entries = currentEntries;
      this.applyHeaderTotalsAndCompatibility(inventoryIn, currentEntries);
      await manager.save(inventoryIn);
      return this.present(inventoryIn);
    });
  }

  async remove(id: string): Promise<void> {
    const inventoryIn = await this.inventoryInRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!inventoryIn) throw new NotFoundException('入库单不存在');
    if (inventoryIn.status !== InventoryInStatus.DRAFT) throw new BadRequestException('只有草稿入库单允许删除');
    inventoryIn.isDeleted = 1;
    await this.inventoryInRepository.save(inventoryIn);
  }

  async submit(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const inventoryIn = await this.findEntityById(id, manager, true);
      if (!inventoryIn) throw new NotFoundException('入库单不存在');
      if (![InventoryInStatus.DRAFT, InventoryInStatus.REJECTED].includes(inventoryIn.status)) {
        throw new BadRequestException('只有草稿或已驳回入库单允许提交');
      }
      if (inventoryIn.inType === InventoryInType.PURCHASE) {
        this.validatePurchaseHeader(inventoryIn);
        await this.validatePurchaseEntries(inventoryIn, manager);
      }
      inventoryIn.status = InventoryInStatus.SUBMITTED;
      return this.present(await manager.save(inventoryIn));
    });
  }

  async approve(id: string, dto: ApproveInventoryInDto = {}) {
    const approvedInventoryIn = await this.dataSource.transaction(async (manager) => {
      const inventoryIn = await this.findEntityById(id, manager, true);
      if (!inventoryIn) throw new NotFoundException('入库单不存在');
      if (inventoryIn.status === InventoryInStatus.APPROVED) {
        return inventoryIn;
      }
      if (inventoryIn.status !== InventoryInStatus.SUBMITTED) throw new BadRequestException('只有待审核入库单允许审核');

      if (inventoryIn.inType !== InventoryInType.PURCHASE) {
        inventoryIn.status = InventoryInStatus.APPROVED;
        inventoryIn.approvedAt = new Date();
        inventoryIn.approvedBy = dto.approvedBy || null;
        return manager.save(inventoryIn);
      }

      this.validatePurchaseHeader(inventoryIn);
      const entries = inventoryIn.entries.filter((entry) => entry.isDeleted === 0).sort((a, b) => a.id.localeCompare(b.id));
      if (!entries.length) throw new BadRequestException('采购入库至少需要一条有效明细');

      const sourceIds = entries.map((entry) => entry.sourceReceiveNoticeEntryId).sort();
      const sources = await manager.getRepository(PurchaseReceiveNoticeEntry)
        .createQueryBuilder('source')
        .innerJoinAndSelect('source.purchaseReceiveNotice', 'notice')
        .where('source.id IN (:...sourceIds)', { sourceIds })
        .andWhere('source.isDeleted = 0')
        .andWhere('notice.isDeleted = 0')
        .orderBy('source.id', 'ASC')
        .setLock('pessimistic_write')
        .getMany();
      if (sources.length !== sourceIds.length) throw new BadRequestException('存在无效的来源收料通知明细');
      const sourceById = new Map(sources.map((source) => [source.id, source]));

      const orderEntryIds = [...new Set(entries.map((entry) => entry.sourceOrderEntryId))].sort();
      const orderEntries = await manager.getRepository(PurchaseOrderEntry)
        .createQueryBuilder('orderEntry')
        .where('orderEntry.id IN (:...orderEntryIds)', { orderEntryIds })
        .andWhere('orderEntry.isDeleted = 0')
        .orderBy('orderEntry.id', 'ASC')
        .setLock('pessimistic_write')
        .getMany();
      if (orderEntries.length !== orderEntryIds.length) throw new BadRequestException('存在无效的来源采购订单明细');
      const orderEntryById = new Map(orderEntries.map((entry) => [entry.id, entry]));

      const orderIds = [...new Set(entries.map((entry) => entry.sourceOrderId))];
      if (orderIds.length !== 1) throw new BadRequestException('P0 采购入库只能对应一张采购订单');
      const order = await manager.findOne(PurchaseOrder, {
        where: { id: orderIds[0], isDeleted: 0 },
        lock: { mode: 'pessimistic_write' },
      });
      if (!order) throw new BadRequestException('来源采购订单不存在');
      const isReturnReplenish = entries.every((entry) => Boolean(entry.sourcePurchaseReturnEntryId));
      if (entries.some((entry) => Boolean(entry.sourcePurchaseReturnEntryId)) !== isReturnReplenish) {
        throw new BadRequestException('禁止混合普通采购入库与退料补料入库明细');
      }
      const allowedOrderStatuses = isReturnReplenish
        ? [PurchaseOrderStatus.APPROVED, PurchaseOrderStatus.FULLY_STOCKED]
        : [PurchaseOrderStatus.APPROVED];
      if (!allowedOrderStatuses.includes(order.status)) {
        throw new BadRequestException(`采购订单 ${order.orderNo} 当前状态不允许采购入库审核`);
      }

      const approvedAt = new Date();
      for (const entry of entries) {
        const source = sourceById.get(entry.sourceReceiveNoticeEntryId);
        const orderEntry = orderEntryById.get(entry.sourceOrderEntryId);
        if (!source || !orderEntry) throw new BadRequestException('采购入库来源明细不存在');
        if (source.purchaseReceiveNotice.status !== PurchaseReceiveNoticeStatus.APPROVED) {
          throw new BadRequestException(`收料通知 ${source.purchaseReceiveNotice.noticeNo} 当前状态不允许采购入库审核`);
        }
        if (source.sourceOrderId !== order.id || orderEntry.purchaseOrderId !== order.id || source.sourceOrderEntryId !== orderEntry.id) {
          throw new BadRequestException('采购入库、收料通知与采购订单来源链不一致');
        }
        await this.assertSourceAvailable(source, Number(entry.quantity), manager, inventoryIn.id);

        const posting = await this.inventoryService.postPurchaseInbound({
          sourceId: inventoryIn.id,
          sourceEntryId: entry.id,
          warehouseId: entry.warehouseId,
          materialId: entry.materialId,
          batchNo: entry.lotNo || '',
          quantity: Number(entry.quantity),
          amount: Number(entry.amount),
          inboundDate: inventoryIn.inDate,
          expiryDate: entry.expiryDate,
        }, manager);
        entry.inventoryPostingId = posting.id;

        source.stockedQty = this.round(Number(source.stockedQty || 0) + Number(entry.quantity), 4);
        if (entry.sourcePurchaseReturnEntryId) {
          const returnEntry = await manager.findOne(PurchaseReturnEntry, {
            where: { id: entry.sourcePurchaseReturnEntryId, isDeleted: 0 },
            lock: { mode: 'pessimistic_write' },
          });
          if (!returnEntry) throw new BadRequestException('补料入库来源采购退料明细不存在');
          const remaining = Number(returnEntry.returnQty) - Number(returnEntry.replenishedStockedQty || 0);
          if (Number(entry.quantity) - remaining > QUANTITY_EPSILON) {
            throw new BadRequestException(`采购退料第${returnEntry.lineNo}行剩余可补料入库数量为 ${Math.max(0, remaining)}`);
          }
          returnEntry.replenishedStockedQty = this.round(Number(returnEntry.replenishedStockedQty || 0) + Number(entry.quantity), 4);
          await manager.save(returnEntry);
          await manager.save([entry, source]);
        } else {
          orderEntry.stockedQty = this.round(Number(orderEntry.stockedQty || 0) + Number(entry.quantity), 4);
          await manager.save([entry, source, orderEntry]);
        }
      }

      if (!isReturnReplenish) {
        const allOrderEntries = await manager.getRepository(PurchaseOrderEntry)
          .createQueryBuilder('entry')
          .where('entry.purchaseOrderId = :orderId', { orderId: order.id })
          .andWhere('entry.isDeleted = 0')
          .orderBy('entry.id', 'ASC')
          .setLock('pessimistic_write')
          .getMany();
        if (allOrderEntries.length && allOrderEntries.every((entry) => Number(entry.stockedQty || 0) + QUANTITY_EPSILON >= Number(entry.orderQty))) {
          order.status = PurchaseOrderStatus.FULLY_STOCKED;
          await manager.save(order);
        }
      }

      inventoryIn.status = InventoryInStatus.APPROVED;
      inventoryIn.approvedAt = approvedAt;
      inventoryIn.approvedBy = dto.approvedBy || null;
      inventoryIn.payableGenerationStatus = isReturnReplenish
        ? PayableGenerationStatus.NOT_REQUIRED
        : PayableGenerationStatus.NOT_GENERATED;
      inventoryIn.payableId = null;
      inventoryIn.payableNo = null;
      inventoryIn.payableGenerationError = null;
      inventoryIn.payableGenerationFailedAt = null;
      inventoryIn.payableGeneratedAt = null;
      inventoryIn.entries = entries;
      return manager.save(inventoryIn);
    });

    if (
      approvedInventoryIn.inType !== InventoryInType.PURCHASE
      || approvedInventoryIn.sourceType === 'PURCHASE_RETURN_REPLENISH'
    ) {
      return this.present(approvedInventoryIn);
    }

    // 入库审核已提交；应付生成失败只记录失败状态，不回滚库存过账和数量反写。
    return this.generateEstimatedPayable(id, dto.approvedBy);
  }

  async generateEstimatedPayable(id: string, operatedBy?: string) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const inventoryIn = await this.findEntityById(id, manager, true);
        if (!inventoryIn) throw new NotFoundException('入库单不存在');
        if (inventoryIn.inType !== InventoryInType.PURCHASE) {
          throw new BadRequestException('只有采购入库允许生成暂估应付');
        }
        if (inventoryIn.status !== InventoryInStatus.APPROVED) {
          throw new BadRequestException('只有已审核采购入库允许生成暂估应付');
        }
        if (inventoryIn.sourceType === 'PURCHASE_RETURN_REPLENISH') {
          throw new BadRequestException('退料补料入库不重复生成暂估应付');
        }
        if (inventoryIn.payableGenerationStatus === PayableGenerationStatus.GENERATED && inventoryIn.payableId) {
          return this.present(inventoryIn);
        }

        const payable = await this.payableService.createEstimatedPayableFromPurchaseInbound({
          inventoryInId: inventoryIn.id,
          inventoryInNo: inventoryIn.inNo,
          supplierId: inventoryIn.supplierId,
          currencyId: inventoryIn.currencyId,
          settleOrgId: inventoryIn.settleOrgId,
          paymentTermId: inventoryIn.paymentTermId,
          untaxedAmount: Number(inventoryIn.amount),
          taxAmount: Number(inventoryIn.taxAmount),
          totalAmount: Number(inventoryIn.totalAmount),
          approvedAt: inventoryIn.approvedAt,
          createdBy: operatedBy || inventoryIn.approvedBy,
          entries: inventoryIn.entries
            .filter((entry) => entry.isDeleted === 0)
            .sort((left, right) => left.lineNo - right.lineNo)
            .map((entry) => ({
              inventoryInEntryId: entry.id,
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
              quantity: Number(entry.quantity),
              unitPrice: Number(entry.unitPrice),
              taxRate: Number(entry.taxRate || 0),
              untaxedAmount: Number(entry.amount || 0),
              taxAmount: Number(entry.taxAmount || 0),
              totalAmount: Number(entry.totalAmount || 0),
            })),
        }, manager);

        inventoryIn.payableGenerationStatus = PayableGenerationStatus.GENERATED;
        inventoryIn.payableId = payable.id;
        inventoryIn.payableNo = payable.payableNo;
        inventoryIn.payableGeneratedAt = new Date();
        inventoryIn.payableGenerationError = null;
        inventoryIn.payableGenerationFailedAt = null;
        return this.present(await manager.save(inventoryIn));
      });
    } catch (error) {
      const failed = await this.recordPayableGenerationFailure(id, error);
      if (failed) return failed;
      throw error;
    }
  }

  private async recordPayableGenerationFailure(id: string, error: unknown) {
    return this.dataSource.transaction(async (manager) => {
      const inventoryIn = await this.findEntityById(id, manager, true);
      if (!inventoryIn) return null;
      if (
        inventoryIn.inType !== InventoryInType.PURCHASE
        || inventoryIn.status !== InventoryInStatus.APPROVED
        || inventoryIn.payableGenerationStatus === PayableGenerationStatus.GENERATED
        || inventoryIn.payableGenerationStatus === PayableGenerationStatus.NOT_REQUIRED
      ) {
        return null;
      }

      inventoryIn.payableGenerationStatus = PayableGenerationStatus.FAILED;
      inventoryIn.payableGenerationError = this.getErrorMessage(error).slice(0, 1000);
      inventoryIn.payableGenerationFailedAt = new Date();
      return this.present(await manager.save(inventoryIn));
    });
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error && error.message) return error.message;
    if (typeof error === 'string') return error;
    return '暂估应付生成失败';
  }

  async reject(id: string) {
    return this.changeStatus(id, [InventoryInStatus.SUBMITTED], InventoryInStatus.REJECTED, '只有待审核入库单允许驳回');
  }

  async cancel(id: string) {
    return this.changeStatus(
      id,
      [InventoryInStatus.DRAFT, InventoryInStatus.SUBMITTED, InventoryInStatus.REJECTED],
      InventoryInStatus.CANCELED,
      '只有草稿、待审核或已驳回入库单允许取消；已审核采购入库必须走冲销单，P0 不允许直接取消',
    );
  }

  private async changeStatus(id: string, from: InventoryInStatus[], to: InventoryInStatus, message: string) {
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntityById(id, manager, true);
      if (!entity) throw new NotFoundException('入库单不存在');
      if (!from.includes(entity.status)) throw new BadRequestException(message);
      entity.status = to;
      return this.present(await manager.save(entity));
    });
  }

  private async findEntityById(id: string, manager: EntityManager, lock = false) {
    return manager.findOne(InventoryIn, {
      where: { id, isDeleted: 0 },
      relations: { entries: true },
      ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}),
    });
  }

  private async validatePurchaseEntries(inventoryIn: InventoryIn, manager: EntityManager) {
    const entries = inventoryIn.entries.filter((entry) => entry.isDeleted === 0);
    if (!entries.length) throw new BadRequestException('采购入库至少需要一条有效明细');
    const sourceIds = entries.map((entry) => entry.sourceReceiveNoticeEntryId).sort();
    const sources = await manager.getRepository(PurchaseReceiveNoticeEntry)
      .createQueryBuilder('source')
      .innerJoinAndSelect('source.purchaseReceiveNotice', 'notice')
      .where('source.id IN (:...sourceIds)', { sourceIds })
      .andWhere('source.isDeleted = 0')
      .orderBy('source.id', 'ASC')
      .setLock('pessimistic_write')
      .getMany();
    if (sources.length !== sourceIds.length) throw new BadRequestException('采购入库来源收料明细不存在');
    const sourceById = new Map(sources.map((source) => [source.id, source]));
    for (const entry of entries) {
      const source = sourceById.get(entry.sourceReceiveNoticeEntryId);
      if (!source || source.purchaseReceiveNotice.status !== PurchaseReceiveNoticeStatus.APPROVED) {
        throw new BadRequestException(`来源收料通知 ${entry.sourceReceiveNoticeNo} 当前状态不允许提交采购入库`);
      }
      await this.assertSourceAvailable(source, Number(entry.quantity), manager, inventoryIn.id);
    }
  }

  private validatePurchaseHeader(inventoryIn: InventoryIn) {
    if (!inventoryIn.stockOrgId || !inventoryIn.purchaseOrgId || !inventoryIn.settleOrgId) {
      throw new BadRequestException('采购入库缺少收料组织、采购组织或结算组织');
    }
    if (!inventoryIn.ownerType || !inventoryIn.ownerId) throw new BadRequestException('采购入库缺少货主类型或货主');
    if (!inventoryIn.supplierId || !inventoryIn.currencyId || !inventoryIn.paymentTermId) {
      throw new BadRequestException('采购入库缺少供应商、币种或付款条件');
    }
    if (!['STANDARD', 'ASSET_INBOUND'].includes(inventoryIn.businessType)) {
      throw new BadRequestException('当前业务类型不支持采购入库');
    }
  }

  private async assertSourceAvailable(
    source: PurchaseReceiveNoticeEntry,
    requestedQty: number,
    manager: EntityManager,
    excludeInventoryInId?: string,
  ) {
    if (requestedQty <= QUANTITY_EPSILON) throw new BadRequestException('采购入库数量必须大于0');
    const requiresInspection = Boolean(source.purchaseReceiveNotice?.needCheck && source.checkIncoming);
    const sourceLimit = requiresInspection
      ? Number(source.qualifiedQty || 0) + Number(source.concessionQty || 0)
      : Number(source.receiveQty || 0);
    const activeOccupation = await this.getActiveOccupation(manager, source.id, excludeInventoryInId);
    const available = this.round(sourceLimit - Number(source.stockedQty || 0) - activeOccupation, 4);
    if (requestedQty - available > QUANTITY_EPSILON) {
      const basis = requiresInspection ? '合格数量+让步接收数量' : '免检收料数量';
      throw new BadRequestException(
        `收料通知 ${source.sourceOrderNo} 明细 ${source.lineNo} 按${basis}计算的可入库数量为 ${Math.max(0, available)}，本次为 ${requestedQty}`,
      );
    }
  }

  private async getActiveOccupation(manager: EntityManager, sourceEntryId: string, excludeInventoryInId?: string) {
    const query = manager.getRepository(InventoryInEntry)
      .createQueryBuilder('entry')
      .innerJoin(InventoryIn, 'inventoryIn', 'inventoryIn.id = entry.inventoryInId')
      .select('COALESCE(SUM(entry.quantity), 0)', 'quantity')
      .where('entry.sourceReceiveNoticeEntryId = :sourceEntryId', { sourceEntryId })
      .andWhere('entry.isDeleted = 0')
      .andWhere('inventoryIn.isDeleted = 0')
      .andWhere('inventoryIn.status IN (:...statuses)', { statuses: ACTIVE_PURCHASE_OCCUPATION_STATUSES });
    if (excludeInventoryInId) query.andWhere('inventoryIn.id <> :excludeInventoryInId', { excludeInventoryInId });
    const raw = await query.getRawOne();
    return Number(raw?.quantity || 0);
  }

  private calculateLine(quantity: number, unitPrice: number, taxRate: number) {
    const normalizedQuantity = this.round(quantity, 4);
    const normalizedPrice = this.round(unitPrice, 4);
    const normalizedTaxRate = this.round(taxRate, 4);
    const amount = this.round(normalizedQuantity * normalizedPrice, 2);
    const taxAmount = this.round(amount * normalizedTaxRate / 100, 2);
    return {
      quantity: normalizedQuantity,
      unitPrice: normalizedPrice,
      taxRate: normalizedTaxRate,
      amount,
      taxAmount,
      totalAmount: this.round(amount + taxAmount, 2),
    };
  }

  private applyHeaderTotalsAndCompatibility(header: InventoryIn, entries: InventoryInEntry[]) {
    const first = entries[0];
    header.amount = this.round(entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0), 2);
    header.taxAmount = this.round(entries.reduce((sum, entry) => sum + Number(entry.taxAmount || 0), 0), 2);
    header.totalAmount = this.round(entries.reduce((sum, entry) => sum + Number(entry.totalAmount || 0), 0), 2);
    if (!first) return;
    header.warehouseId = first.warehouseId;
    header.warehouseCode = first.warehouseCode;
    header.warehouseName = first.warehouseName;
    header.materialId = first.materialId;
    header.materialCode = first.materialCode;
    header.materialName = first.materialName;
    header.spec = first.materialModel;
    header.unitId = first.unitId;
    header.unitCode = first.unitCode;
    header.unitName = first.unitName;
    header.quantity = first.quantity;
    header.unitPrice = first.unitPrice;
    header.lotNo = first.lotNo;
    header.expireDate = first.expiryDate;
    header.location = first.location;
  }

  private calculatePushPayloadHash(dto: PushReceiveNoticesToInventoryInDto) {
    const normalized = {
      inDate: dto.inDate || null,
      settleOrgId: dto.settleOrgId,
      ownerType: dto.ownerType,
      ownerId: dto.ownerId,
      businessType: dto.businessType || 'STANDARD',
      remark: dto.remark || null,
      entries: [...dto.entries]
        .map((entry) => ({
          sourceReceiveNoticeEntryId: entry.sourceReceiveNoticeEntryId,
          quantity: this.round(Number(entry.quantity), 4),
          warehouseId: entry.warehouseId,
          lotNo: entry.lotNo || null,
          produceDate: entry.produceDate || null,
          expiryDate: entry.expiryDate || null,
          location: entry.location || null,
          remark: entry.remark || null,
        }))
        .sort((a, b) => a.sourceReceiveNoticeEntryId.localeCompare(b.sourceReceiveNoticeEntryId)),
    };
    return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
  }

  private assertIdempotentPayload(existing: InventoryIn, payloadHash: string) {
    if (existing.pushPayloadHash !== payloadHash) {
      throw new BadRequestException('幂等键已被不同请求载荷使用');
    }
    return this.present(existing);
  }

  private assertUnique(values: string[], message: string) {
    if (new Set(values).size !== values.length) throw new BadRequestException(message);
  }

  private assertSameValue(values: string[], message: string) {
    if (new Set(values).size !== 1) throw new BadRequestException(message);
  }

  private round(value: number, scale: number) {
    const factor = 10 ** scale;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }
}
