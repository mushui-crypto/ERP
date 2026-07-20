import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { AssetAcceptance } from '../../database/entities/asset-acceptance.entity';
import { AssetAcceptanceEntry } from '../../database/entities/asset-acceptance-entry.entity';
import { AssetOutRequest } from '../../database/entities/asset-out-request.entity';
import { AssetOutRequestEntry } from '../../database/entities/asset-out-request-entry.entity';
import { InventoryOutEntry } from '../../database/entities/inventory-out-entry.entity';
import { InventoryOut } from '../../database/entities/inventory-out.entity';
import { Warehouse } from '../../database/entities/warehouse.entity';
import { AssetOutRequestStatus } from '../asset-out-request/asset-out-request.status';
import { DownstreamGenerationStatus } from '../asset-acceptance/asset-acceptance.status';
import { FixedAssetService } from '../fixed-asset/fixed-asset.service';
import { InventoryService } from '../inventory/inventory.service';
import { generateDocumentNo, withStatusMeta } from '../purchase-common/purchase-status';
import { ApproveInventoryOutDto, CreateInventoryOutDto, CreateInventoryOutFromAssetRequestDto, UpdateInventoryOutDto } from './dto/inventory-out.dto';

enum InventoryOutStatus { DRAFT = 0, SUBMITTED = 1, APPROVED = 2, CANCELED = 3, REJECTED = 4 }
const STATUS_META = {
  0: { code: 'DRAFT', name: '草稿' }, 1: { code: 'SUBMITTED', name: '待审核' }, 2: { code: 'APPROVED', name: '已审核' },
  3: { code: 'CANCELED', name: '已取消' }, 4: { code: 'REJECTED', name: '已驳回' },
};

@Injectable()
export class InventoryOutService {
  constructor(
    @InjectRepository(InventoryOut) private readonly repository: Repository<InventoryOut>,
    private readonly dataSource: DataSource,
    private readonly inventoryService: InventoryService,
    private readonly fixedAssetService: FixedAssetService,
  ) {}

  private present(entity: InventoryOut) {
    return withStatusMeta({ ...entity, quantity: Number(entity.quantity || 0), amount: Number(entity.amount || 0),
      entries: (entity.entries || []).filter((entry) => entry.isDeleted === 0).sort((a, b) => a.lineNo - b.lineNo).map((entry) => ({
        ...entry, quantity: Number(entry.quantity), unitPrice: Number(entry.unitPrice), amount: Number(entry.amount),
      })) }, STATUS_META);
  }

  private findEntity(id: string, manager?: EntityManager, lock = false) {
    const repository = manager ? manager.getRepository(InventoryOut) : this.repository;
    return repository.findOne({ where: { id, isDeleted: 0 }, relations: { entries: true }, order: { entries: { lineNo: 'ASC' } },
      ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}) });
  }

  async findAll(page = 1, pageSize = 20, outNo?: string, materialCode?: string, outType?: number) {
    const query = this.repository.createQueryBuilder('out').leftJoinAndSelect('out.entries', 'entry', 'entry.isDeleted = 0').where('out.isDeleted = 0');
    if (outNo) query.andWhere('out.outNo LIKE :outNo', { outNo: `%${outNo}%` });
    if (materialCode) query.andWhere('(out.materialCode LIKE :materialCode OR entry.materialCode LIKE :materialCode)', { materialCode: `%${materialCode}%` });
    if (outType !== undefined) query.andWhere('out.outType = :outType', { outType });
    const [list, total] = await query.skip((page - 1) * pageSize).take(pageSize).orderBy('out.createdAt', 'DESC').addOrderBy('entry.lineNo', 'ASC').getManyAndCount();
    return { list: list.map((item) => this.present(item)), total, page, pageSize };
  }

  async findById(id: string) { const entity = await this.findEntity(id); return entity ? this.present(entity) : null; }

  async create(dto: CreateInventoryOutDto) {
    return this.dataSource.transaction(async (manager) => {
      const unitPrice = Number(dto.unitPrice || 0); const amount = Number(dto.amount ?? unitPrice * Number(dto.quantity));
      const entity = await manager.save(manager.create(InventoryOut, {
        ...dto, outNo: generateDocumentNo('OUT'), sourceType: dto.sourceId ? 'MANUAL_SOURCE' : 'MANUAL',
        businessType: null, status: InventoryOutStatus.DRAFT, unitPrice, amount, outDate: dto.outDate || new Date(),
        assetCardGenerationStatus: DownstreamGenerationStatus.NOT_REQUIRED,
      }));
      entity.entries = [await manager.save(manager.create(InventoryOutEntry, {
        inventoryOutId: entity.id, lineNo: 1, warehouseId: dto.warehouseId, materialId: dto.materialId,
        materialCode: dto.materialCode, materialName: dto.materialName, materialModel: dto.spec,
        unitId: dto.unitId, unitCode: dto.unitCode, unitName: dto.unitName, quantity: Number(dto.quantity),
        unitPrice, amount, lotNo: dto.lotNo || null, location: dto.location || null,
      }))];
      return this.present(entity);
    });
  }

  async createFromAssetOutRequest(requestId: string, dto: CreateInventoryOutFromAssetRequestDto) {
    const hash = createHash('sha256').update(JSON.stringify({ requestId, outDate: dto.outDate || null, remark: dto.remark || null })).digest('hex');
    const existing = await this.repository.findOne({ where: { pushIdempotencyKey: dto.idempotencyKey, isDeleted: 0 }, relations: { entries: true } });
    if (existing) return this.assertIdempotent(existing, hash);
    try {
      return await this.dataSource.transaction(async (manager) => {
        const concurrent = await manager.findOne(InventoryOut, { where: { pushIdempotencyKey: dto.idempotencyKey, isDeleted: 0 }, relations: { entries: true }, lock: { mode: 'pessimistic_write' } });
        if (concurrent) return this.assertIdempotent(concurrent, hash);
        const request = await manager.findOne(AssetOutRequest, { where: { id: requestId, isDeleted: 0 }, relations: { entries: true }, lock: { mode: 'pessimistic_write' } });
        if (!request) throw new NotFoundException('资产出库申请不存在');
        if (request.status === AssetOutRequestStatus.PUSHED && request.inventoryOutId) {
          const pushed = await this.findEntity(request.inventoryOutId, manager, true);
          if (!pushed) throw new BadRequestException('资产出库申请已下推但其他出库单不存在');
          if (pushed.pushIdempotencyKey !== dto.idempotencyKey) throw new BadRequestException('资产出库申请已使用其他幂等键下推');
          return this.assertIdempotent(pushed, hash);
        }
        if (request.status !== AssetOutRequestStatus.APPROVED) throw new BadRequestException('只有已审核资产出库申请允许下推其他出库');
        const warehouse = await manager.findOne(Warehouse, { where: { id: request.warehouseId, isDeleted: 0, status: 1 }, lock: { mode: 'pessimistic_read' } });
        if (!warehouse) throw new BadRequestException('出库仓库不存在或未启用');
        const acceptance = await manager.findOne(AssetAcceptance, { where: { id: request.sourceAssetAcceptanceId, isDeleted: 0 }, lock: { mode: 'pessimistic_read' } });
        if (!acceptance) throw new BadRequestException('来源资产验收不存在');
        const requestEntries = request.entries.filter((entry) => entry.isDeleted === 0);
        if (!requestEntries.length) throw new BadRequestException('资产出库申请没有有效明细');
        const first = requestEntries[0];
        const entity = await manager.save(manager.create(InventoryOut, {
          outNo: generateDocumentNo('OUT'), pushIdempotencyKey: dto.idempotencyKey, pushPayloadHash: hash,
          sourceType: 'ASSET_OUT_REQUEST', businessType: 'ASSET_INBOUND', orgId: request.orgId,
          warehouseId: warehouse.id, warehouseCode: warehouse.warehouseCode, warehouseName: warehouse.warehouseName,
          outType: 4, sourceId: request.id, sourceNo: request.requestNo, departmentId: request.departmentId,
          materialId: first.materialId, materialCode: first.materialCode, materialName: first.materialName,
          spec: first.materialModel, unitId: first.unitId, unitCode: first.unitCode || '', unitName: first.unitName || '',
          quantity: first.requestQty, unitPrice: first.unitPrice, amount: first.amount, lotNo: first.lotNo,
          location: first.location, outDate: dto.outDate ? new Date(dto.outDate) : new Date(), status: InventoryOutStatus.DRAFT,
          assetCardGenerationStatus: DownstreamGenerationStatus.NOT_GENERATED, remark: dto.remark || null,
        }));
        entity.entries = [];
        for (let index = 0; index < requestEntries.length; index += 1) {
          const source = requestEntries[index];
          const acceptanceEntry = await manager.findOne(AssetAcceptanceEntry, { where: { id: source.sourceAssetAcceptanceEntryId, isDeleted: 0 }, lock: { mode: 'pessimistic_read' } });
          if (!acceptanceEntry) throw new BadRequestException('资产出库申请来源验收明细不存在');
          entity.entries.push(await manager.save(manager.create(InventoryOutEntry, {
            inventoryOutId: entity.id, lineNo: index + 1, warehouseId: request.warehouseId,
            materialId: source.materialId, materialCode: source.materialCode, materialName: source.materialName,
            materialModel: source.materialModel, unitId: source.unitId, unitCode: source.unitCode, unitName: source.unitName,
            quantity: Number(source.requestQty), unitPrice: Number(source.unitPrice), amount: Number(source.amount), lotNo: source.lotNo,
            sourceAssetOutRequestEntryId: source.id, sourceAssetAcceptanceId: acceptance.id,
            sourceAssetAcceptanceEntryId: acceptanceEntry.id, sourceInventoryInEntryId: source.sourceInventoryInEntryId,
            sourceOrderId: acceptanceEntry.sourceOrderId, sourceOrderEntryId: acceptanceEntry.sourceOrderEntryId,
            sourceRequestId: acceptanceEntry.sourceRequestId, sourceRequestEntryId: acceptanceEntry.sourceRequestEntryId,
            assetCategoryCode: source.assetCategoryCode, departmentId: source.departmentId || request.departmentId,
            custodianId: source.custodianId, location: source.location,
          })));
        }
        request.status = AssetOutRequestStatus.PUSHED; request.inventoryOutId = entity.id; request.inventoryOutNo = entity.outNo;
        await manager.save(request); return this.present(entity);
      });
    } catch (error) {
      const concurrent = await this.repository.findOne({ where: { pushIdempotencyKey: dto.idempotencyKey, isDeleted: 0 }, relations: { entries: true } });
      if (concurrent) return this.assertIdempotent(concurrent, hash);
      throw error;
    }
  }

  async update(id: string, dto: UpdateInventoryOutDto) {
    const entity = await this.findEntity(id); if (!entity) throw new NotFoundException('出库单不存在');
    if (entity.sourceType === 'ASSET_OUT_REQUEST') throw new BadRequestException('资产其他出库不允许修改来源数量和金额');
    if (entity.status >= InventoryOutStatus.APPROVED) throw new BadRequestException('已审核的出库单不允许修改');
    Object.assign(entity, dto); if (dto.unitPrice !== undefined && dto.quantity !== undefined) entity.amount = Number(dto.unitPrice) * Number(dto.quantity);
    return this.present(await this.repository.save(entity));
  }

  async remove(id: string) { const entity = await this.findEntity(id); if (!entity) throw new NotFoundException('出库单不存在');
    if (entity.status >= InventoryOutStatus.SUBMITTED) throw new BadRequestException('已提交的出库单不允许删除');
    if (entity.sourceType === 'ASSET_OUT_REQUEST') throw new BadRequestException('资产出库申请来源单据不允许删除，只能取消申请后重新下推');
    entity.isDeleted = 1; await this.repository.save(entity); }

  submit(id: string) { return this.changeStatus(id, [InventoryOutStatus.DRAFT, InventoryOutStatus.REJECTED], InventoryOutStatus.SUBMITTED, '只能提交草稿或已驳回出库单'); }

  async approve(id: string, dto: ApproveInventoryOutDto) {
    const approved = await this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntity(id, manager, true); if (!entity) throw new NotFoundException('出库单不存在');
      if (entity.status !== InventoryOutStatus.SUBMITTED) throw new BadRequestException('只能审核待审核状态的出库单');
      if (entity.sourceType === 'ASSET_OUT_REQUEST') {
        const request = await manager.findOne(AssetOutRequest, { where: { id: entity.sourceId, isDeleted: 0 }, relations: { entries: true }, lock: { mode: 'pessimistic_write' } });
        if (!request || request.status !== AssetOutRequestStatus.PUSHED) throw new BadRequestException('来源资产出库申请状态不允许审核其他出库');
        const requestById = new Map(request.entries.filter((entry) => entry.isDeleted === 0).map((entry) => [entry.id, entry]));
        for (const entry of entity.entries.filter((item) => item.isDeleted === 0)) {
          const requestEntry = requestById.get(entry.sourceAssetOutRequestEntryId);
          if (!requestEntry) throw new BadRequestException('其他出库来源申请明细不存在');
          const remaining = Number(requestEntry.requestQty) - Number(requestEntry.outQty || 0);
          if (Number(entry.quantity) - remaining > 0.000001) throw new BadRequestException(`资产出库申请剩余可出库数量为 ${Math.max(0, remaining)}`);
          const posting = await this.inventoryService.postAssetOtherOutbound({ sourceId: entity.id, sourceEntryId: entry.id,
            warehouseId: entry.warehouseId, materialId: entry.materialId, batchNo: entry.lotNo || '', quantity: Number(entry.quantity), amount: Number(entry.amount) }, manager);
          entry.inventoryPostingId = posting.id; requestEntry.outQty = Number(requestEntry.outQty || 0) + Number(entry.quantity);
          await manager.save([entry, requestEntry]);
        }
      }
      entity.status = InventoryOutStatus.APPROVED; entity.approvedAt = new Date(); entity.approvedBy = dto.approvedBy || null;
      await manager.save(entity); return entity;
    });
    if (approved.sourceType !== 'ASSET_OUT_REQUEST') return this.present(approved);
    return this.generateAssetCards(id);
  }

  async generateAssetCards(id: string) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const entity = await this.findEntity(id, manager, true); if (!entity) throw new NotFoundException('出库单不存在');
        if (entity.sourceType !== 'ASSET_OUT_REQUEST' || entity.status !== InventoryOutStatus.APPROVED) throw new BadRequestException('只有已审核资产其他出库允许生成资产卡片');
        if (entity.assetCardGenerationStatus === DownstreamGenerationStatus.GENERATED) return this.present(entity);
        const cards = await this.fixedAssetService.createCardsFromPurchase({
          sourceType: 'ASSET_INVENTORY_OUT', sourceId: entity.id, sourceNo: entity.outNo, inventoryOutId: entity.id,
          purchaseDate: entity.outDate, createdBy: entity.approvedBy,
          entries: entity.entries.filter((entry) => entry.isDeleted === 0).map((entry) => ({
            sourceEntryId: entry.id, assetAcceptanceId: entry.sourceAssetAcceptanceId,
            assetAcceptanceEntryId: entry.sourceAssetAcceptanceEntryId, inventoryOutEntryId: entry.id,
            purchaseOrderId: entry.sourceOrderId, purchaseOrderEntryId: entry.sourceOrderEntryId,
            purchaseRequestId: entry.sourceRequestId, purchaseRequestEntryId: entry.sourceRequestEntryId,
            assetName: entry.materialName, specification: entry.materialModel, categoryCode: entry.assetCategoryCode,
            quantity: Number(entry.quantity), unitPrice: Number(entry.unitPrice), departmentId: entry.departmentId, location: entry.location,
          })),
        }, manager);
        entity.assetCardGenerationStatus = DownstreamGenerationStatus.GENERATED; entity.assetCardGeneratedAt = new Date();
        entity.assetCardGenerationError = null; entity.assetCardGenerationFailedAt = null; await manager.save(entity);
        return { ...this.present(entity), assetCardIds: cards.map((card) => card.id), assetCardNos: cards.map((card) => card.assetNo) };
      });
    } catch (error) {
      return this.dataSource.transaction(async (manager) => {
        const entity = await this.findEntity(id, manager, true); if (!entity) throw error;
        if (entity.assetCardGenerationStatus !== DownstreamGenerationStatus.GENERATED) {
          entity.assetCardGenerationStatus = DownstreamGenerationStatus.FAILED;
          entity.assetCardGenerationError = (error instanceof Error ? error.message : String(error)).slice(0, 1000);
          entity.assetCardGenerationFailedAt = new Date(); await manager.save(entity);
        }
        return this.present(entity);
      });
    }
  }

  reject(id: string) { return this.changeStatus(id, [InventoryOutStatus.SUBMITTED], InventoryOutStatus.REJECTED, '只能驳回待审核出库单'); }
  async cancel(id: string) {
    const entity = await this.findEntity(id); if (!entity) throw new NotFoundException('出库单不存在');
    if (entity.sourceType === 'ASSET_OUT_REQUEST') throw new BadRequestException('资产出库申请已下推后不允许取消其他出库单');
    return this.changeStatus(id, [InventoryOutStatus.DRAFT, InventoryOutStatus.SUBMITTED, InventoryOutStatus.REJECTED], InventoryOutStatus.CANCELED, '当前出库单状态不允许取消');
  }

  private changeStatus(id: string, from: InventoryOutStatus[], to: InventoryOutStatus, message: string) {
    return this.dataSource.transaction(async (manager) => { const entity = await this.findEntity(id, manager, true); if (!entity) throw new NotFoundException('出库单不存在');
      if (!from.includes(entity.status)) throw new BadRequestException(message); entity.status = to; await manager.save(entity); return this.present(entity); });
  }
  private assertIdempotent(entity: InventoryOut, hash: string) { if (entity.pushPayloadHash !== hash) throw new BadRequestException('幂等键已被不同请求载荷使用'); return this.present(entity); }
}
