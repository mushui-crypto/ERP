import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { DataSource, EntityManager, In } from 'typeorm';
import { AssetAcceptance } from '../../database/entities/asset-acceptance.entity';
import { AssetAcceptanceEntry } from '../../database/entities/asset-acceptance-entry.entity';
import { FinAssetCategory } from '../../database/entities/fin-asset-category.entity';
import { InventoryIn } from '../../database/entities/inventory-in.entity';
import { InventoryInEntry } from '../../database/entities/inventory-in-entry.entity';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';
import { PurchaseReceiveNotice } from '../../database/entities/purchase-receive-notice.entity';
import { PurchaseReceiveNoticeEntry } from '../../database/entities/purchase-receive-notice-entry.entity';
import { FixedAssetService } from '../fixed-asset/fixed-asset.service';
import { InventoryInStatus } from '../inventory-in/inventory-in.status';
import { PayableService } from '../payable/payable.service';
import { PurchaseReceiveNoticeStatus, generateDocumentNo, withStatusMeta } from '../purchase-common/purchase-status';
import { ASSET_ACCEPTANCE_STATUS_META, AssetAcceptanceStatus, DownstreamGenerationStatus } from './asset-acceptance.status';
import { ApproveAssetAcceptanceDto, AssetAcceptanceLineDto, CreateAssetAcceptanceDto, UpdateAssetAcceptanceDto } from './dto/asset-acceptance.dto';

const EPSILON = 0.000001;
const ACTIVE_OCCUPATION = [AssetAcceptanceStatus.DRAFT, AssetAcceptanceStatus.SUBMITTED];

@Injectable()
export class AssetAcceptanceService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly payableService: PayableService,
    private readonly fixedAssetService: FixedAssetService,
  ) {}

  private present(entity: AssetAcceptance) {
    return withStatusMeta({
      ...entity,
      amount: Number(entity.amount || 0),
      taxAmount: Number(entity.taxAmount || 0),
      totalAmount: Number(entity.totalAmount || 0),
      entries: (entity.entries || []).filter((entry) => entry.isDeleted === 0).sort((a, b) => a.lineNo - b.lineNo).map((entry) => ({
        ...entry,
        acceptanceQty: Number(entry.acceptanceQty),
        passedQty: Number(entry.passedQty),
        failedQty: Number(entry.failedQty),
        availableOutQty: Math.max(0, Number(entry.passedQty) - Number(entry.outRequestedQty || 0)),
      })),
    }, ASSET_ACCEPTANCE_STATUS_META);
  }

  async findAll(page: number, pageSize: number, businessType?: string, status?: number) {
    const query = this.dataSource.getRepository(AssetAcceptance).createQueryBuilder('a')
      .leftJoinAndSelect('a.entries', 'entry', 'entry.isDeleted = 0').where('a.isDeleted = 0');
    if (businessType) query.andWhere('a.businessType = :businessType', { businessType });
    if (status !== undefined) query.andWhere('a.status = :status', { status });
    const [list, total] = await query.orderBy('a.createdAt', 'DESC').addOrderBy('entry.lineNo', 'ASC')
      .skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { list: list.map((item) => this.present(item)), total, page, pageSize };
  }

  private findEntity(id: string, manager?: EntityManager, lock = false) {
    const repository = manager ? manager.getRepository(AssetAcceptance) : this.dataSource.getRepository(AssetAcceptance);
    return repository.findOne({
      where: { id, isDeleted: 0 }, relations: { entries: true }, order: { entries: { lineNo: 'ASC' } },
      ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}),
    });
  }

  async findById(id: string) {
    const entity = await this.findEntity(id);
    return entity ? this.present(entity) : null;
  }

  createFromReceiveNotice(dto: CreateAssetAcceptanceDto) {
    return this.createFromSource(dto, 'RECEIVE_NOTICE');
  }

  createFromInventoryIn(dto: CreateAssetAcceptanceDto) {
    return this.createFromSource(dto, 'INVENTORY_IN');
  }

  private async createFromSource(dto: CreateAssetAcceptanceDto, sourceType: 'RECEIVE_NOTICE' | 'INVENTORY_IN') {
    const payloadHash = this.payloadHash(dto, sourceType);
    const repository = this.dataSource.getRepository(AssetAcceptance);
    const existing = await repository.findOne({ where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 }, relations: { entries: true } });
    if (existing) return this.assertIdempotent(existing, payloadHash);
    try {
      return await this.dataSource.transaction(async (manager) => {
        const concurrent = await manager.findOne(AssetAcceptance, { where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 }, relations: { entries: true }, lock: { mode: 'pessimistic_write' } });
        if (concurrent) return this.assertIdempotent(concurrent, payloadHash);
        const context = sourceType === 'RECEIVE_NOTICE'
          ? await this.loadReceiveContext(dto, manager)
          : await this.loadInboundContext(dto, manager);
        const header = manager.create(AssetAcceptance, {
          acceptanceNo: generateDocumentNo('AA'), idempotencyKey: dto.idempotencyKey, payloadHash,
          businessType: context.businessType, sourceType, sourceId: context.sourceId, sourceNo: context.sourceNo,
          orgId: context.orgId, purchaseOrgId: context.purchaseOrgId, stockOrgId: context.stockOrgId,
          settleOrgId: context.settleOrgId, supplierId: context.supplierId, currencyId: context.currencyId,
          paymentTermId: context.paymentTermId, acceptanceDate: dto.acceptanceDate ? new Date(dto.acceptanceDate) : new Date(),
          departmentId: dto.departmentId || null, acceptorId: dto.acceptorId || null, status: AssetAcceptanceStatus.DRAFT,
          payableGenerationStatus: context.businessType === 'ASSET_NO_INBOUND' ? DownstreamGenerationStatus.NOT_GENERATED : DownstreamGenerationStatus.NOT_REQUIRED,
          assetCardGenerationStatus: context.businessType === 'ASSET_NO_INBOUND' ? DownstreamGenerationStatus.NOT_GENERATED : DownstreamGenerationStatus.NOT_REQUIRED,
          amount: 0, taxAmount: 0, totalAmount: 0, remark: dto.remark || null,
        });
        await manager.save(header);
        header.entries = await manager.save(context.entries.map((entry, index) => manager.create(AssetAcceptanceEntry, {
          ...entry, assetAcceptanceId: header.id, lineNo: index + 1,
        })));
        this.applyTotals(header);
        await manager.save(header);
        return this.present(header);
      });
    } catch (error) {
      const concurrent = await repository.findOne({ where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 }, relations: { entries: true } });
      if (concurrent) return this.assertIdempotent(concurrent, payloadHash);
      throw error;
    }
  }

  private async loadReceiveContext(dto: CreateAssetAcceptanceDto, manager: EntityManager) {
    const notice = await manager.findOne(PurchaseReceiveNotice, { where: { id: dto.sourceId, isDeleted: 0 }, relations: { entries: true }, lock: { mode: 'pessimistic_write' } });
    if (!notice) throw new NotFoundException('来源收料通知不存在');
    if (notice.status !== PurchaseReceiveNoticeStatus.APPROVED) throw new BadRequestException('只有已审核收料通知允许生成资产验收');
    if (notice.businessType !== 'ASSET_NO_INBOUND') throw new BadRequestException('该收料通知不是资产采购不入库业务');
    if (!dto.settleOrgId) throw new BadRequestException('资产采购不入库验收必须提供结算组织');
    const order = await manager.findOne(PurchaseOrder, { where: { id: notice.purchaseOrderId, isDeleted: 0 }, lock: { mode: 'pessimistic_read' } });
    if (!order) throw new BadRequestException('来源采购订单不存在');
    const sourceById = new Map(notice.entries.filter((entry) => entry.isDeleted === 0).map((entry) => [entry.id, entry]));
    const entries = await this.resolveLines(dto.entries, sourceById, 'RECEIVE_NOTICE', manager);
    return {
      businessType: notice.businessType, sourceId: notice.id, sourceNo: notice.noticeNo,
      orgId: notice.purchaseOrgId, purchaseOrgId: notice.purchaseOrgId, stockOrgId: notice.stockOrgId,
      settleOrgId: dto.settleOrgId, supplierId: notice.supplierId, currencyId: order.currencyId,
      paymentTermId: order.paymentTermId, entries,
    };
  }

  private async loadInboundContext(dto: CreateAssetAcceptanceDto, manager: EntityManager) {
    const inbound = await manager.findOne(InventoryIn, { where: { id: dto.sourceId, isDeleted: 0 }, relations: { entries: true }, lock: { mode: 'pessimistic_write' } });
    if (!inbound) throw new NotFoundException('来源采购入库不存在');
    if (inbound.status !== InventoryInStatus.APPROVED) throw new BadRequestException('只有已审核采购入库允许生成资产验收');
    if (inbound.businessType !== 'ASSET_INBOUND') throw new BadRequestException('该采购入库不是资产采购入库业务');
    const sourceById = new Map(inbound.entries.filter((entry) => entry.isDeleted === 0).map((entry) => [entry.id, entry]));
    const entries = await this.resolveLines(dto.entries, sourceById, 'INVENTORY_IN', manager);
    return {
      businessType: inbound.businessType, sourceId: inbound.id, sourceNo: inbound.inNo,
      orgId: inbound.orgId, purchaseOrgId: inbound.purchaseOrgId, stockOrgId: inbound.stockOrgId,
      settleOrgId: inbound.settleOrgId, supplierId: inbound.supplierId, currencyId: inbound.currencyId,
      paymentTermId: inbound.paymentTermId, entries,
    };
  }

  private async resolveLines(
    lines: AssetAcceptanceLineDto[],
    sourceById: Map<string, PurchaseReceiveNoticeEntry | InventoryInEntry>,
    sourceType: 'RECEIVE_NOTICE' | 'INVENTORY_IN',
    manager: EntityManager,
    excludeAcceptanceId?: string,
  ) {
    if (new Set(lines.map((line) => line.sourceEntryId)).size !== lines.length) throw new BadRequestException('资产验收来源明细不能重复');
    const categories = await manager.find(FinAssetCategory, { where: { categoryCode: In([...new Set(lines.map((line) => line.assetCategoryCode))]), isDeleted: 0, status: 1 } });
    if (categories.length !== new Set(lines.map((line) => line.assetCategoryCode)).size) throw new BadRequestException('存在无效或未启用的资产类别');
    const entries: Partial<AssetAcceptanceEntry>[] = [];
    for (const line of lines) {
      const source = sourceById.get(line.sourceEntryId);
      if (!source) throw new BadRequestException(`来源明细不存在: ${line.sourceEntryId}`);
      this.validateLine(line);
      const sourceLimit = sourceType === 'RECEIVE_NOTICE' ? Number((source as PurchaseReceiveNoticeEntry).receiveQty) : Number((source as InventoryInEntry).quantity);
      const acceptedQty = Number((source as PurchaseReceiveNoticeEntry | InventoryInEntry).assetAcceptedQty || 0);
      const occupied = await this.activeOccupation(sourceType, line.sourceEntryId, manager, excludeAcceptanceId);
      const available = this.round(sourceLimit - acceptedQty - occupied, 4);
      if (Number(line.acceptanceQty) - available > EPSILON) throw new BadRequestException(`来源明细可验收数量为 ${Math.max(0, available)}，本次为 ${line.acceptanceQty}`);
      const passedQty = Number(line.passedQty);
      const unitPrice = Number(source.unitPrice || 0);
      const taxRate = Number(source.taxRate || 0);
      const amount = this.round(passedQty * unitPrice, 2);
      const taxAmount = this.round(amount * taxRate / 100, 2);
      const inbound = source as InventoryInEntry;
      const receive = source as PurchaseReceiveNoticeEntry;
      entries.push({
        sourceReceiveNoticeId: sourceType === 'RECEIVE_NOTICE' ? receive.purchaseReceiveNoticeId : inbound.sourceReceiveNoticeId,
        sourceReceiveNoticeEntryId: sourceType === 'RECEIVE_NOTICE' ? receive.id : inbound.sourceReceiveNoticeEntryId,
        sourceInventoryInId: sourceType === 'INVENTORY_IN' ? inbound.inventoryInId : null,
        sourceInventoryInEntryId: sourceType === 'INVENTORY_IN' ? inbound.id : null,
        sourceOrderId: source.sourceOrderId, sourceOrderEntryId: source.sourceOrderEntryId,
        sourceRequestId: source.sourceRequestId, sourceRequestEntryId: source.sourceRequestEntryId,
        materialId: source.materialId, materialCode: source.materialCode, materialName: source.materialName,
        materialModel: source.materialModel, unitId: source.unitId, unitCode: source.unitCode, unitName: source.unitName,
        acceptanceQty: Number(line.acceptanceQty), passedQty, failedQty: Number(line.failedQty), outRequestedQty: 0, assetCardQty: 0,
        unitPrice, taxRate, amount, taxAmount, totalAmount: this.round(amount + taxAmount, 2),
        assetCategoryCode: line.assetCategoryCode, departmentId: line.departmentId || null,
        custodianId: line.custodianId || null, location: line.location || null,
        lotNo: sourceType === 'INVENTORY_IN' ? inbound.lotNo : receive.supplierLot,
        remark: line.remark || null,
      });
    }
    return entries;
  }

  private validateLine(line: AssetAcceptanceLineDto) {
    if (Math.abs(Number(line.acceptanceQty) - Number(line.passedQty) - Number(line.failedQty)) > EPSILON) {
      throw new BadRequestException('验收通过数量与不通过数量之和必须等于验收数量');
    }
    if (!Number.isInteger(Number(line.passedQty))) throw new BadRequestException('一物一卡规则要求验收通过数量为整数');
  }

  private async activeOccupation(sourceType: string, sourceEntryId: string, manager: EntityManager, excludeId?: string) {
    const field = sourceType === 'RECEIVE_NOTICE' ? 'entry.sourceReceiveNoticeEntryId' : 'entry.sourceInventoryInEntryId';
    const query = manager.getRepository(AssetAcceptanceEntry).createQueryBuilder('entry')
      .innerJoin(AssetAcceptance, 'header', 'header.id = entry.assetAcceptanceId')
      .select('COALESCE(SUM(entry.acceptanceQty), 0)', 'quantity')
      .where(`${field} = :sourceEntryId`, { sourceEntryId }).andWhere('entry.isDeleted = 0').andWhere('header.isDeleted = 0')
      .andWhere('header.status IN (:...statuses)', { statuses: ACTIVE_OCCUPATION });
    if (excludeId) query.andWhere('header.id <> :excludeId', { excludeId });
    return Number((await query.getRawOne())?.quantity || 0);
  }

  async update(id: string, dto: UpdateAssetAcceptanceDto) {
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntity(id, manager, true);
      if (!entity) throw new NotFoundException('资产验收单不存在');
      if (![AssetAcceptanceStatus.DRAFT, AssetAcceptanceStatus.REJECTED].includes(entity.status)) throw new BadRequestException('只有草稿或已驳回资产验收允许修改');
      entity.acceptanceDate = dto.acceptanceDate ? new Date(dto.acceptanceDate) : entity.acceptanceDate;
      entity.departmentId = dto.departmentId ?? entity.departmentId;
      entity.acceptorId = dto.acceptorId ?? entity.acceptorId;
      entity.remark = dto.remark ?? entity.remark;
      if (dto.entries) {
        const source = entity.sourceType === 'RECEIVE_NOTICE'
          ? await manager.findOne(PurchaseReceiveNotice, { where: { id: entity.sourceId, isDeleted: 0 }, relations: { entries: true }, lock: { mode: 'pessimistic_write' } })
          : await manager.findOne(InventoryIn, { where: { id: entity.sourceId, isDeleted: 0 }, relations: { entries: true }, lock: { mode: 'pessimistic_write' } });
        if (!source) throw new BadRequestException('资产验收来源单据不存在');
        const sourceById = new Map(source.entries.filter((entry) => entry.isDeleted === 0).map((entry) => [entry.id, entry]));
        const resolved = await this.resolveLines(dto.entries, sourceById as Map<string, PurchaseReceiveNoticeEntry | InventoryInEntry>, entity.sourceType as 'RECEIVE_NOTICE' | 'INVENTORY_IN', manager, entity.id);
        for (const old of entity.entries.filter((entry) => entry.isDeleted === 0)) { old.isDeleted = 1; await manager.save(old); }
        entity.entries = await manager.save(resolved.map((entry, index) => manager.create(AssetAcceptanceEntry, { ...entry, assetAcceptanceId: entity.id, lineNo: index + 1 })));
        this.applyTotals(entity);
      }
      await manager.save(entity);
      return this.present(entity);
    });
  }

  async submit(id: string) { return this.changeStatus(id, [AssetAcceptanceStatus.DRAFT, AssetAcceptanceStatus.REJECTED], AssetAcceptanceStatus.SUBMITTED, '只有草稿或已驳回资产验收允许提交'); }
  async reject(id: string) { return this.changeStatus(id, [AssetAcceptanceStatus.SUBMITTED], AssetAcceptanceStatus.REJECTED, '只有待审核资产验收允许驳回'); }
  async cancel(id: string) { return this.changeStatus(id, [AssetAcceptanceStatus.DRAFT, AssetAcceptanceStatus.SUBMITTED, AssetAcceptanceStatus.REJECTED], AssetAcceptanceStatus.CANCELED, '当前资产验收状态不允许取消'); }

  async approve(id: string, dto: ApproveAssetAcceptanceDto) {
    const approved = await this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntity(id, manager, true);
      if (!entity) throw new NotFoundException('资产验收单不存在');
      if (entity.status !== AssetAcceptanceStatus.SUBMITTED) throw new BadRequestException('只有待审核资产验收允许审核');
      for (const entry of entity.entries.filter((item) => item.isDeleted === 0)) {
        const source = entity.sourceType === 'RECEIVE_NOTICE'
          ? await manager.findOne(PurchaseReceiveNoticeEntry, { where: { id: entry.sourceReceiveNoticeEntryId, isDeleted: 0 }, lock: { mode: 'pessimistic_write' } })
          : await manager.findOne(InventoryInEntry, { where: { id: entry.sourceInventoryInEntryId, isDeleted: 0 }, lock: { mode: 'pessimistic_write' } });
        if (!source) throw new BadRequestException('资产验收来源明细不存在');
        const limit = entity.sourceType === 'RECEIVE_NOTICE' ? Number((source as PurchaseReceiveNoticeEntry).receiveQty) : Number((source as InventoryInEntry).quantity);
        const available = this.round(limit - Number(source.assetAcceptedQty || 0), 4);
        if (Number(entry.passedQty) - available > EPSILON) throw new BadRequestException(`来源明细剩余可通过验收数量为 ${Math.max(0, available)}`);
        source.assetAcceptedQty = this.round(Number(source.assetAcceptedQty || 0) + Number(entry.passedQty), 4);
        await manager.save(source);
      }
      entity.status = AssetAcceptanceStatus.APPROVED;
      entity.approvedAt = new Date();
      entity.approvedBy = dto.approvedBy || null;
      await manager.save(entity);
      return entity;
    });
    if (approved.businessType !== 'ASSET_NO_INBOUND') return this.present(approved);
    await this.generateEstimatedPayable(id);
    return this.generateAssetCards(id);
  }

  async generateEstimatedPayable(id: string) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const entity = await this.findEntity(id, manager, true);
        if (!entity) throw new NotFoundException('资产验收单不存在');
        if (entity.status !== AssetAcceptanceStatus.APPROVED || entity.businessType !== 'ASSET_NO_INBOUND') throw new BadRequestException('只有已审核资产采购不入库验收允许生成暂估应付');
        if (entity.payableGenerationStatus === DownstreamGenerationStatus.GENERATED && entity.payableId) return this.present(entity);
        const payable = await this.payableService.createEstimatedPayableFromAssetAcceptance({
          assetAcceptanceId: entity.id, assetAcceptanceNo: entity.acceptanceNo, supplierId: entity.supplierId,
          currencyId: entity.currencyId, settleOrgId: entity.settleOrgId, paymentTermId: entity.paymentTermId,
          approvedAt: entity.approvedAt, createdBy: entity.approvedBy,
          entries: entity.entries.filter((entry) => entry.isDeleted === 0 && Number(entry.passedQty) > 0).map((entry) => ({
            assetAcceptanceEntryId: entry.id, sourceReceiveNoticeEntryId: entry.sourceReceiveNoticeEntryId,
            sourceOrderEntryId: entry.sourceOrderEntryId, sourceRequestEntryId: entry.sourceRequestEntryId,
            materialId: entry.materialId, materialCode: entry.materialCode, materialName: entry.materialName,
            materialModel: entry.materialModel, unitId: entry.unitId, unitCode: entry.unitCode, unitName: entry.unitName,
            quantity: Number(entry.passedQty), unitPrice: Number(entry.unitPrice), taxRate: Number(entry.taxRate),
            untaxedAmount: Number(entry.amount), taxAmount: Number(entry.taxAmount), totalAmount: Number(entry.totalAmount),
          })),
        }, manager);
        entity.payableGenerationStatus = DownstreamGenerationStatus.GENERATED;
        entity.payableId = payable.id; entity.payableNo = payable.payableNo; entity.payableGeneratedAt = new Date();
        entity.payableGenerationError = null; entity.payableGenerationFailedAt = null;
        return this.present(await manager.save(entity));
      });
    } catch (error) {
      return this.recordFailure(id, 'PAYABLE', error);
    }
  }

  async generateAssetCards(id: string) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const entity = await this.findEntity(id, manager, true);
        if (!entity) throw new NotFoundException('资产验收单不存在');
        if (entity.status !== AssetAcceptanceStatus.APPROVED || entity.businessType !== 'ASSET_NO_INBOUND') throw new BadRequestException('只有已审核资产采购不入库验收允许生成资产卡片');
        if (entity.assetCardGenerationStatus === DownstreamGenerationStatus.GENERATED) return this.present(entity);
        const entries = entity.entries.filter((entry) => entry.isDeleted === 0 && Number(entry.passedQty) > 0);
        const cards = await this.fixedAssetService.createCardsFromPurchase({
          sourceType: 'ASSET_ACCEPTANCE', sourceId: entity.id, sourceNo: entity.acceptanceNo,
          purchaseDate: entity.acceptanceDate, createdBy: entity.approvedBy,
          entries: entries.map((entry) => ({
            sourceEntryId: entry.id, assetAcceptanceId: entity.id, assetAcceptanceEntryId: entry.id,
            purchaseOrderId: entry.sourceOrderId, purchaseOrderEntryId: entry.sourceOrderEntryId,
            purchaseRequestId: entry.sourceRequestId, purchaseRequestEntryId: entry.sourceRequestEntryId,
            assetName: entry.materialName, specification: entry.materialModel, categoryCode: entry.assetCategoryCode,
            quantity: Number(entry.passedQty), unitPrice: Number(entry.unitPrice), departmentId: entry.departmentId || entity.departmentId,
            location: entry.location,
          })),
        }, manager);
        for (const entry of entries) {
          entry.assetCardQty = cards.filter((card) => card.sourceEntryId === entry.id).length;
          await manager.save(entry);
        }
        entity.assetCardGenerationStatus = DownstreamGenerationStatus.GENERATED;
        entity.assetCardGeneratedAt = new Date(); entity.assetCardGenerationError = null; entity.assetCardGenerationFailedAt = null;
        return this.present(await manager.save(entity));
      });
    } catch (error) {
      return this.recordFailure(id, 'ASSET_CARD', error);
    }
  }

  private async recordFailure(id: string, target: 'PAYABLE' | 'ASSET_CARD', error: unknown) {
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntity(id, manager, true);
      if (!entity) throw error;
      const message = error instanceof Error ? error.message : String(error);
      if (target === 'PAYABLE' && entity.payableGenerationStatus !== DownstreamGenerationStatus.GENERATED) {
        entity.payableGenerationStatus = DownstreamGenerationStatus.FAILED;
        entity.payableGenerationError = message.slice(0, 1000); entity.payableGenerationFailedAt = new Date();
      }
      if (target === 'ASSET_CARD' && entity.assetCardGenerationStatus !== DownstreamGenerationStatus.GENERATED) {
        entity.assetCardGenerationStatus = DownstreamGenerationStatus.FAILED;
        entity.assetCardGenerationError = message.slice(0, 1000); entity.assetCardGenerationFailedAt = new Date();
      }
      return this.present(await manager.save(entity));
    });
  }

  private changeStatus(id: string, from: AssetAcceptanceStatus[], to: AssetAcceptanceStatus, message: string) {
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntity(id, manager, true);
      if (!entity) throw new NotFoundException('资产验收单不存在');
      if (!from.includes(entity.status)) throw new BadRequestException(message);
      entity.status = to; await manager.save(entity); return this.present(entity);
    });
  }

  private applyTotals(entity: AssetAcceptance) {
    entity.amount = this.round(entity.entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0), 2);
    entity.taxAmount = this.round(entity.entries.reduce((sum, entry) => sum + Number(entry.taxAmount || 0), 0), 2);
    entity.totalAmount = this.round(entity.entries.reduce((sum, entry) => sum + Number(entry.totalAmount || 0), 0), 2);
  }

  private payloadHash(dto: CreateAssetAcceptanceDto, sourceType: string) {
    const normalized = { sourceType, sourceId: dto.sourceId, settleOrgId: dto.settleOrgId || null, acceptanceDate: dto.acceptanceDate || null,
      departmentId: dto.departmentId || null, acceptorId: dto.acceptorId || null, remark: dto.remark || null,
      entries: [...dto.entries].map((entry) => ({ ...entry })).sort((a, b) => a.sourceEntryId.localeCompare(b.sourceEntryId)) };
    return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
  }

  private assertIdempotent(existing: AssetAcceptance, payloadHash: string) {
    if (existing.payloadHash !== payloadHash) throw new BadRequestException('幂等键已被不同请求载荷使用');
    return this.present(existing);
  }

  private round(value: number, scale: number) {
    const factor = 10 ** scale;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }
}
