import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { DataSource, EntityManager, In } from 'typeorm';
import { AssetAcceptance } from '../../database/entities/asset-acceptance.entity';
import { AssetOutRequest } from '../../database/entities/asset-out-request.entity';
import { AssetOutRequestEntry } from '../../database/entities/asset-out-request-entry.entity';
import { Warehouse } from '../../database/entities/warehouse.entity';
import { AssetAcceptanceStatus } from '../asset-acceptance/asset-acceptance.status';
import { InventoryOutService } from '../inventory-out/inventory-out.service';
import { generateDocumentNo, withStatusMeta } from '../purchase-common/purchase-status';
import { ASSET_OUT_REQUEST_STATUS_META, AssetOutRequestStatus } from './asset-out-request.status';
import { ApproveAssetOutRequestDto, CreateAssetOutRequestDto, PushAssetOutRequestDto, UpdateAssetOutRequestDto } from './dto/asset-out-request.dto';

@Injectable()
export class AssetOutRequestService {
  constructor(private readonly dataSource: DataSource, private readonly inventoryOutService: InventoryOutService) {}

  private present(entity: AssetOutRequest) {
    return withStatusMeta({ ...entity, entries: (entity.entries || []).filter((entry) => entry.isDeleted === 0).sort((a, b) => a.lineNo - b.lineNo).map((entry) => ({
      ...entry, requestQty: Number(entry.requestQty), outQty: Number(entry.outQty || 0), remainingOutQty: Math.max(0, Number(entry.requestQty) - Number(entry.outQty || 0)),
    })) }, ASSET_OUT_REQUEST_STATUS_META);
  }

  private findEntity(id: string, manager?: EntityManager, lock = false) {
    const repository = manager ? manager.getRepository(AssetOutRequest) : this.dataSource.getRepository(AssetOutRequest);
    return repository.findOne({ where: { id, isDeleted: 0 }, relations: { entries: true }, order: { entries: { lineNo: 'ASC' } },
      ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}) });
  }

  async findAll(page: number, pageSize: number, status?: number) {
    const query = this.dataSource.getRepository(AssetOutRequest).createQueryBuilder('r').leftJoinAndSelect('r.entries', 'entry', 'entry.isDeleted = 0').where('r.isDeleted = 0');
    if (status !== undefined) query.andWhere('r.status = :status', { status });
    const [list, total] = await query.orderBy('r.createdAt', 'DESC').addOrderBy('entry.lineNo', 'ASC').skip((page - 1) * pageSize).take(pageSize).getManyAndCount();
    return { list: list.map((item) => this.present(item)), total, page, pageSize };
  }

  async findById(id: string) { const entity = await this.findEntity(id); return entity ? this.present(entity) : null; }

  async createFromAssetAcceptance(dto: CreateAssetOutRequestDto) {
    const payloadHash = this.hash(dto);
    const repository = this.dataSource.getRepository(AssetOutRequest);
    const existing = await repository.findOne({ where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 }, relations: { entries: true } });
    if (existing) return this.assertIdempotent(existing, payloadHash);
    try {
      return await this.dataSource.transaction(async (manager) => {
        const concurrent = await manager.findOne(AssetOutRequest, { where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 }, relations: { entries: true }, lock: { mode: 'pessimistic_write' } });
        if (concurrent) return this.assertIdempotent(concurrent, payloadHash);
        const acceptance = await manager.findOne(AssetAcceptance, { where: { id: dto.assetAcceptanceId, isDeleted: 0 }, relations: { entries: true }, lock: { mode: 'pessimistic_write' } });
        if (!acceptance) throw new NotFoundException('来源资产验收单不存在');
        if (acceptance.status !== AssetAcceptanceStatus.APPROVED || acceptance.businessType !== 'ASSET_INBOUND') throw new BadRequestException('只有已审核资产采购入库验收允许生成出库申请');
        const sourceExisting = await manager.findOne(AssetOutRequest, {
          where: {
            sourceAssetAcceptanceId: acceptance.id,
            status: In([
              AssetOutRequestStatus.DRAFT,
              AssetOutRequestStatus.SUBMITTED,
              AssetOutRequestStatus.APPROVED,
              AssetOutRequestStatus.PUSHED,
              AssetOutRequestStatus.REJECTED,
            ]),
            isDeleted: 0,
          },
          relations: { entries: true },
          lock: { mode: 'pessimistic_write' },
        });
        if (sourceExisting) {
          if (sourceExisting.idempotencyKey !== dto.idempotencyKey) throw new BadRequestException('资产验收已生成出库申请');
          return this.assertIdempotent(sourceExisting, payloadHash);
        }
        const warehouse = await manager.findOne(Warehouse, { where: { id: dto.warehouseId, isDeleted: 0, status: 1 }, lock: { mode: 'pessimistic_read' } });
        if (!warehouse) throw new BadRequestException('出库仓库不存在或未启用');
        const acceptanceEntries = acceptance.entries.filter((entry) => entry.isDeleted === 0 && Number(entry.passedQty) > Number(entry.outRequestedQty || 0));
        if (!acceptanceEntries.length) throw new BadRequestException('资产验收没有可申请出库数量');
        const request = manager.create(AssetOutRequest, {
          requestNo: generateDocumentNo('AOR'), idempotencyKey: dto.idempotencyKey, payloadHash,
          sourceAssetAcceptanceId: acceptance.id, sourceAssetAcceptanceNo: acceptance.acceptanceNo,
          orgId: acceptance.orgId, warehouseId: warehouse.id, departmentId: dto.departmentId || acceptance.departmentId,
          applicantId: dto.applicantId || null, requestDate: dto.requestDate ? new Date(dto.requestDate) : new Date(),
          status: AssetOutRequestStatus.DRAFT, remark: dto.remark || null,
        });
        await manager.save(request);
        request.entries = [];
        for (let index = 0; index < acceptanceEntries.length; index += 1) {
          const source = acceptanceEntries[index];
          const quantity = Number(source.passedQty) - Number(source.outRequestedQty || 0);
          request.entries.push(await manager.save(manager.create(AssetOutRequestEntry, {
            assetOutRequestId: request.id, lineNo: index + 1, sourceAssetAcceptanceEntryId: source.id,
            sourceInventoryInEntryId: source.sourceInventoryInEntryId, materialId: source.materialId,
            materialCode: source.materialCode, materialName: source.materialName, materialModel: source.materialModel,
            unitId: source.unitId, unitCode: source.unitCode, unitName: source.unitName, lotNo: source.lotNo,
            requestQty: quantity, outQty: 0, unitPrice: source.unitPrice, amount: this.round(quantity * Number(source.unitPrice), 2),
            assetCategoryCode: source.assetCategoryCode, departmentId: source.departmentId || request.departmentId,
            custodianId: source.custodianId, location: source.location,
          })));
          source.outRequestedQty = this.round(Number(source.outRequestedQty || 0) + quantity, 4);
          await manager.save(source);
        }
        acceptance.outRequestId = request.id; acceptance.outRequestNo = request.requestNo; await manager.save(acceptance);
        return this.present(request);
      });
    } catch (error) {
      const concurrent = await repository.findOne({ where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 }, relations: { entries: true } });
      if (concurrent) return this.assertIdempotent(concurrent, payloadHash);
      throw error;
    }
  }

  async update(id: string, dto: UpdateAssetOutRequestDto) {
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntity(id, manager, true);
      if (!entity) throw new NotFoundException('资产出库申请不存在');
      if (![AssetOutRequestStatus.DRAFT, AssetOutRequestStatus.REJECTED].includes(entity.status)) throw new BadRequestException('只有草稿或已驳回资产出库申请允许修改');
      if (dto.warehouseId && dto.warehouseId !== entity.warehouseId) {
        const warehouse = await manager.findOne(Warehouse, { where: { id: dto.warehouseId, isDeleted: 0, status: 1 } });
        if (!warehouse) throw new BadRequestException('出库仓库不存在或未启用');
        entity.warehouseId = warehouse.id;
      }
      entity.departmentId = dto.departmentId ?? entity.departmentId; entity.applicantId = dto.applicantId ?? entity.applicantId;
      entity.requestDate = dto.requestDate ? new Date(dto.requestDate) : entity.requestDate; entity.remark = dto.remark ?? entity.remark;
      await manager.save(entity); return this.present(entity);
    });
  }

  submit(id: string) { return this.changeStatus(id, [AssetOutRequestStatus.DRAFT, AssetOutRequestStatus.REJECTED], AssetOutRequestStatus.SUBMITTED, '只有草稿或已驳回资产出库申请允许提交'); }
  reject(id: string) { return this.changeStatus(id, [AssetOutRequestStatus.SUBMITTED], AssetOutRequestStatus.REJECTED, '只有待审核资产出库申请允许驳回'); }
  async approve(id: string, dto: ApproveAssetOutRequestDto) {
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntity(id, manager, true); if (!entity) throw new NotFoundException('资产出库申请不存在');
      if (entity.status !== AssetOutRequestStatus.SUBMITTED) throw new BadRequestException('只有待审核资产出库申请允许审核');
      entity.status = AssetOutRequestStatus.APPROVED; entity.approvedAt = new Date(); entity.approvedBy = dto.approvedBy || null;
      await manager.save(entity); return this.present(entity);
    });
  }

  async cancel(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntity(id, manager, true); if (!entity) throw new NotFoundException('资产出库申请不存在');
      if (![AssetOutRequestStatus.DRAFT, AssetOutRequestStatus.SUBMITTED, AssetOutRequestStatus.REJECTED].includes(entity.status)) throw new BadRequestException('当前资产出库申请状态不允许取消');
      const acceptance = await manager.findOne(AssetAcceptance, { where: { id: entity.sourceAssetAcceptanceId, isDeleted: 0 }, relations: { entries: true }, lock: { mode: 'pessimistic_write' } });
      const sourceById = new Map((acceptance?.entries || []).map((entry) => [entry.id, entry]));
      for (const entry of entity.entries.filter((item) => item.isDeleted === 0)) {
        const source = sourceById.get(entry.sourceAssetAcceptanceEntryId);
        if (source) { source.outRequestedQty = this.round(Math.max(0, Number(source.outRequestedQty || 0) - Number(entry.requestQty)), 4); await manager.save(source); }
      }
      entity.status = AssetOutRequestStatus.CANCELED; if (acceptance) { acceptance.outRequestId = null; acceptance.outRequestNo = null; await manager.save(acceptance); }
      await manager.save(entity); return this.present(entity);
    });
  }

  pushInventoryOut(id: string, dto: PushAssetOutRequestDto) { return this.inventoryOutService.createFromAssetOutRequest(id, dto); }

  private changeStatus(id: string, from: AssetOutRequestStatus[], to: AssetOutRequestStatus, message: string) {
    return this.dataSource.transaction(async (manager) => { const entity = await this.findEntity(id, manager, true); if (!entity) throw new NotFoundException('资产出库申请不存在');
      if (!from.includes(entity.status)) throw new BadRequestException(message); entity.status = to; await manager.save(entity); return this.present(entity); });
  }
  private hash(dto: CreateAssetOutRequestDto) { return createHash('sha256').update(JSON.stringify({ ...dto, requestDate: dto.requestDate || null })).digest('hex'); }
  private assertIdempotent(entity: AssetOutRequest, hash: string) { if (entity.payloadHash !== hash) throw new BadRequestException('幂等键已被不同请求载荷使用'); return this.present(entity); }
  private round(value: number, scale: number) { const factor = 10 ** scale; return Math.round((Number(value) + Number.EPSILON) * factor) / factor; }
}
