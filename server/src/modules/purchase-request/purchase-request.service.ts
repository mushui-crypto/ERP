import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { PurchaseRequest } from '../../database/entities/purchase-request.entity';
import { PurchaseRequestEntry } from '../../database/entities/purchase-request-entry.entity';
import {
  PURCHASE_REQUEST_STATUS_META,
  PurchaseRequestStatus,
  PurchaseBillType,
  PurchaseBusinessType,
  generateDocumentNo,
  withStatusMeta,
} from '../purchase-common/purchase-status';
import {
  ApprovePurchaseRequestDto,
  CreatePurchaseRequestDto,
  ImportPurchaseRequestDto,
  PurchaseRequestEntryDto,
  UpdatePurchaseRequestDto,
} from './dto/purchase-request.dto';

@Injectable()
export class PurchaseRequestService {
  constructor(
    @InjectRepository(PurchaseRequest)
    private readonly requestRepository: Repository<PurchaseRequest>,
    @InjectRepository(PurchaseRequestEntry)
    private readonly entryRepository: Repository<PurchaseRequestEntry>,
    private readonly dataSource: DataSource,
  ) {}

  private normalizeEntries(dto: CreatePurchaseRequestDto): PurchaseRequestEntryDto[] {
    if (dto.entries?.length) return dto.entries;
    if (!dto.purchaseOrgId || !dto.materialId || !dto.materialCode || !dto.materialName || !dto.unitId || !dto.quantity) {
      throw new BadRequestException('采购申请至少需要一条明细；旧接口必须完整提供采购组织、物料、单位和申请数量');
    }
    return [{
      purchaseOrgId: dto.purchaseOrgId,
      materialId: dto.materialId,
      materialCode: dto.materialCode,
      materialName: dto.materialName,
      unitId: dto.unitId,
      unitCode: dto.unitCode,
      unitName: dto.unitName,
      requestQty: dto.quantity,
      estimatedPrice: dto.estimatedPrice,
      estimatedAmount: dto.estimatedAmount,
      requiredDate: dto.requiredDate,
      supplierId: dto.supplierId,
      supplierCode: dto.supplierCode,
      supplierName: dto.supplierName,
      warehouseId: dto.warehouseId,
    }];
  }

  private present(request: PurchaseRequest) {
    const entries = (request.entries || []).map((entry) => {
      const requestQty = Number(entry.requestQty);
      const approveQty = entry.approveQty === null || entry.approveQty === undefined
        ? requestQty
        : Number(entry.approveQty);
      const purchasedQty = Number(entry.purchasedQty || 0);
      return {
        ...entry,
        requestQty,
        approveQty,
        purchasedQty,
        remainingPurchaseQty: Math.max(0, approveQty - purchasedQty),
      };
    });
    return withStatusMeta({ ...request, entries }, PURCHASE_REQUEST_STATUS_META);
  }

  async findAll(page = 1, pageSize = 20, requestNo?: string, materialCode?: string, status?: number) {
    const query = this.requestRepository.createQueryBuilder('pr')
      .leftJoinAndSelect('pr.entries', 'entry', 'entry.isDeleted = 0')
      .where('pr.isDeleted = 0');
    if (requestNo) query.andWhere('pr.requestNo LIKE :requestNo', { requestNo: `%${requestNo}%` });
    if (materialCode) {
      query.andWhere('(entry.materialCode LIKE :materialCode OR pr.materialCode LIKE :materialCode)', {
        materialCode: `%${materialCode}%`,
      });
    }
    if (status !== undefined) query.andWhere('pr.status = :status', { status });
    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('pr.createdAt', 'DESC')
      .addOrderBy('entry.lineNo', 'ASC')
      .getManyAndCount();
    return { list: list.map((item) => this.present(item)), total, page, pageSize };
  }

  async findEntityById(id: string): Promise<PurchaseRequest | null> {
    return this.requestRepository.findOne({
      where: { id, isDeleted: 0 },
      relations: { entries: true },
      order: { entries: { lineNo: 'ASC' } },
    });
  }

  async findById(id: string) {
    const request = await this.findEntityById(id);
    return request ? this.present(request) : null;
  }

  async findByStatus(status: number, page = 1, pageSize = 20) {
    return this.findAll(page, pageSize, undefined, undefined, status);
  }

  async create(dto: CreatePurchaseRequestDto) {
    this.validatePurchaseType(dto.billType, dto.businessType);
    const sourceEntries = this.normalizeEntries(dto);
    return this.dataSource.transaction((manager) => this.createWithManager(dto, sourceEntries, manager));
  }

  private async createWithManager(
    dto: CreatePurchaseRequestDto,
    sourceEntries: PurchaseRequestEntryDto[],
    manager: EntityManager,
    external?: Pick<PurchaseRequest, 'externalSourceType' | 'externalSourceId' | 'externalSourceNo' | 'importPayloadHash'>,
  ) {
      const first = sourceEntries[0];
      const request = manager.create(PurchaseRequest, {
        requestNo: generateDocumentNo('PR'),
        billType: dto.billType || PurchaseBillType.STANDARD_PURCHASE,
        businessType: dto.businessType || PurchaseBusinessType.STANDARD,
        orgId: dto.orgId,
        departmentId: dto.departmentId,
        applicantId: dto.applicantId,
        applicantName: dto.applicantName,
        requestType: dto.requestType || 'STANDARD',
        requestDate: dto.requestDate ? new Date(dto.requestDate) : new Date(),
        reason: dto.reason,
        remark: dto.remark,
        status: PurchaseRequestStatus.DRAFT,
        materialId: first.materialId,
        materialCode: first.materialCode,
        materialName: first.materialName,
        unitId: first.unitId,
        unitCode: first.unitCode,
        unitName: first.unitName,
        quantity: first.requestQty,
        purchasedQty: 0,
        estimatedPrice: first.estimatedPrice || 0,
        estimatedAmount: first.estimatedAmount ?? Number(first.estimatedPrice || 0) * Number(first.requestQty),
        requiredDate: first.requiredDate ? new Date(first.requiredDate) : null,
        supplierId: first.supplierId,
        supplierCode: first.supplierCode,
        supplierName: first.supplierName,
        warehouseId: first.warehouseId,
        ...external,
      });
      const saved = await manager.save(request);
      const entries = sourceEntries.map((item, index) => manager.create(PurchaseRequestEntry, {
        ...item,
        purchaseRequestId: saved.id,
        lineNo: index + 1,
        requestQty: Number(item.requestQty),
        approveQty: null,
        purchasedQty: 0,
        estimatedPrice: Number(item.estimatedPrice || 0),
        estimatedAmount: item.estimatedAmount ?? Number(item.estimatedPrice || 0) * Number(item.requestQty),
        requiredDate: item.requiredDate ? new Date(item.requiredDate) : null,
      }));
      saved.entries = await manager.save(entries);
      return this.present(saved);
  }

  async update(id: string, dto: UpdatePurchaseRequestDto) {
    return this.dataSource.transaction(async (manager) => {
      const request = await manager.findOne(PurchaseRequest, {
        where: { id, isDeleted: 0 },
        relations: { entries: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!request) throw new NotFoundException('采购申请单不存在');
      if (![PurchaseRequestStatus.DRAFT, PurchaseRequestStatus.REJECTED].includes(request.status)) {
        throw new BadRequestException('只有草稿或已驳回状态的采购申请允许修改');
      }
      this.validatePurchaseType(dto.billType || request.billType, dto.businessType || request.businessType);
      const sourceEntries = this.normalizeEntries(dto);
      const duplicateIds = sourceEntries
        .map((item) => item.id)
        .filter((entryId): entryId is string => Boolean(entryId))
        .filter((entryId, index, all) => all.indexOf(entryId) !== index);
      if (duplicateIds.length) throw new BadRequestException('采购申请明细ID不能重复');

      const activeEntries = request.entries.filter((entry) => entry.isDeleted === 0);
      const existingById = new Map(activeEntries.map((entry) => [entry.id, entry]));
      for (const item of sourceEntries) {
        if (item.id && !existingById.has(item.id)) {
          throw new BadRequestException(`采购申请明细 ${item.id} 不属于当前采购申请`);
        }
      }
      Object.assign(request, {
        orgId: dto.orgId,
        departmentId: dto.departmentId,
        applicantId: dto.applicantId,
        applicantName: dto.applicantName,
        requestType: dto.requestType || request.requestType,
        billType: dto.billType || request.billType,
        businessType: dto.businessType || request.businessType,
        requestDate: dto.requestDate ? new Date(dto.requestDate) : request.requestDate,
        reason: dto.reason,
        remark: dto.remark,
      });
      const first = sourceEntries[0];
      Object.assign(request, {
        materialId: first.materialId,
        materialCode: first.materialCode,
        materialName: first.materialName,
        unitId: first.unitId,
        unitCode: first.unitCode,
        unitName: first.unitName,
        quantity: first.requestQty,
        estimatedPrice: first.estimatedPrice || 0,
        estimatedAmount: first.estimatedAmount ?? Number(first.estimatedPrice || 0) * Number(first.requestQty),
        requiredDate: first.requiredDate ? new Date(first.requiredDate) : null,
        supplierId: first.supplierId,
        supplierCode: first.supplierCode,
        supplierName: first.supplierName,
        warehouseId: first.warehouseId,
      });
      await manager.save(request);

      const retainedIds = new Set(sourceEntries.map((item) => item.id).filter(Boolean));
      for (const existing of activeEntries) {
        if (retainedIds.has(existing.id)) continue;
        if (Number(existing.purchasedQty || 0) > 0) {
          throw new BadRequestException(`采购申请明细第${existing.lineNo}行已有采购数量，不允许删除`);
        }
        existing.isDeleted = 1;
        await manager.save(existing);
      }

      const nextEntries: PurchaseRequestEntry[] = [];
      for (let index = 0; index < sourceEntries.length; index += 1) {
        const item = sourceEntries[index];
        const existing = item.id ? existingById.get(item.id) : undefined;
        if (existing && Number(item.requestQty) + 0.000001 < Number(existing.purchasedQty || 0)) {
          throw new BadRequestException(`采购申请明细第${existing.lineNo}行申请数量不能小于已采购数量`);
        }
        const entry = existing || manager.create(PurchaseRequestEntry, {
          purchaseRequestId: request.id,
          purchasedQty: 0,
          approveQty: null,
        });
        Object.assign(entry, {
          purchaseOrgId: item.purchaseOrgId,
          materialId: item.materialId,
          materialCode: item.materialCode,
          materialName: item.materialName,
          materialModel: item.materialModel,
          unitId: item.unitId,
          unitCode: item.unitCode,
          unitName: item.unitName,
          lineNo: index + 1,
          requestQty: Number(item.requestQty),
          estimatedPrice: Number(item.estimatedPrice || 0),
          estimatedAmount: item.estimatedAmount ?? Number(item.estimatedPrice || 0) * Number(item.requestQty),
          requiredDate: item.requiredDate ? new Date(item.requiredDate) : null,
          supplierId: item.supplierId,
          supplierCode: item.supplierCode,
          supplierName: item.supplierName,
          warehouseId: item.warehouseId,
          contractNo: item.contractNo,
          remark: item.remark,
          isDeleted: 0,
        });
        nextEntries.push(await manager.save(entry));
      }
      request.entries = nextEntries;
      return this.present(request);
    });
  }

  async importFromExternal(dto: ImportPurchaseRequestDto) {
    if (dto.externalSourceType !== 'OA') throw new BadRequestException('P2 资产采购申请只接受 OA 审批来源');
    if (dto.billType !== PurchaseBillType.ASSET_PURCHASE) throw new BadRequestException('资产采购导入单据类型必须为 ASSET_PURCHASE');
    if (![PurchaseBusinessType.ASSET_NO_INBOUND, PurchaseBusinessType.ASSET_INBOUND].includes(dto.businessType as PurchaseBusinessType)) {
      throw new BadRequestException('资产采购导入业务类型必须为 ASSET_NO_INBOUND 或 ASSET_INBOUND');
    }
    const payloadHash = this.calculateImportPayloadHash(dto);
    const existing = await this.requestRepository.findOne({
      where: { externalSourceType: dto.externalSourceType, externalSourceId: dto.externalSourceId, isDeleted: 0 },
      relations: { entries: true },
    });
    if (existing) {
      if (existing.importPayloadHash !== payloadHash) throw new BadRequestException('OA 来源已被不同请求载荷使用');
      return this.present(existing);
    }
    try {
      const sourceEntries = this.normalizeEntries(dto);
      return await this.dataSource.transaction(async (manager) => {
        const concurrent = await manager.findOne(PurchaseRequest, {
          where: { externalSourceType: dto.externalSourceType, externalSourceId: dto.externalSourceId, isDeleted: 0 },
          relations: { entries: true },
          lock: { mode: 'pessimistic_write' },
        });
        if (concurrent) {
          if (concurrent.importPayloadHash !== payloadHash) throw new BadRequestException('OA 来源已被不同请求载荷使用');
          return this.present(concurrent);
        }
        return this.createWithManager(dto, sourceEntries, manager, {
          externalSourceType: dto.externalSourceType,
          externalSourceId: dto.externalSourceId,
          externalSourceNo: dto.externalSourceNo || null,
          importPayloadHash: payloadHash,
        });
      });
    } catch (error) {
      const concurrent = await this.requestRepository.findOne({
        where: { externalSourceType: dto.externalSourceType, externalSourceId: dto.externalSourceId, isDeleted: 0 },
        relations: { entries: true },
      });
      if (concurrent) {
        if (concurrent.importPayloadHash !== payloadHash) throw new BadRequestException('OA 来源已被不同请求载荷使用');
        return this.present(concurrent);
      }
      throw error;
    }
  }

  private validatePurchaseType(billType?: string, businessType?: string) {
    const normalizedBillType = billType || PurchaseBillType.STANDARD_PURCHASE;
    const normalizedBusinessType = businessType || PurchaseBusinessType.STANDARD;
    if (normalizedBillType === PurchaseBillType.STANDARD_PURCHASE && normalizedBusinessType !== PurchaseBusinessType.STANDARD) {
      throw new BadRequestException('标准采购单据只能使用 STANDARD 业务类型');
    }
    if (
      normalizedBillType === PurchaseBillType.ASSET_PURCHASE &&
      ![PurchaseBusinessType.ASSET_NO_INBOUND, PurchaseBusinessType.ASSET_INBOUND].includes(normalizedBusinessType as PurchaseBusinessType)
    ) {
      throw new BadRequestException('资产采购单据业务类型不正确');
    }
  }

  private calculateImportPayloadHash(dto: ImportPurchaseRequestDto) {
    const normalized = {
      externalSourceType: dto.externalSourceType,
      externalSourceId: dto.externalSourceId,
      externalSourceNo: dto.externalSourceNo || null,
      billType: dto.billType,
      businessType: dto.businessType,
      orgId: dto.orgId,
      departmentId: dto.departmentId || null,
      applicantId: dto.applicantId || null,
      applicantName: dto.applicantName || null,
      requestType: dto.requestType || null,
      requestDate: dto.requestDate || null,
      reason: dto.reason || null,
      remark: dto.remark || null,
      entries: [...(dto.entries || [])].map((entry) => ({
        purchaseOrgId: entry.purchaseOrgId,
        materialId: entry.materialId,
        materialCode: entry.materialCode,
        materialName: entry.materialName,
        materialModel: entry.materialModel || null,
        unitId: entry.unitId,
        unitCode: entry.unitCode || null,
        unitName: entry.unitName || null,
        requestQty: Number(entry.requestQty),
        estimatedPrice: Number(entry.estimatedPrice || 0),
        estimatedAmount: entry.estimatedAmount === undefined ? null : Number(entry.estimatedAmount),
        requiredDate: entry.requiredDate || null,
        supplierId: entry.supplierId || null,
        supplierCode: entry.supplierCode || null,
        supplierName: entry.supplierName || null,
        warehouseId: entry.warehouseId || null,
        contractNo: entry.contractNo || null,
        remark: entry.remark || null,
      })).sort((a, b) => `${a.materialId}:${a.purchaseOrgId}`.localeCompare(`${b.materialId}:${b.purchaseOrgId}`)),
    };
    return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
  }

  async remove(id: string): Promise<void> {
    const request = await this.requestRepository.findOneBy({ id, isDeleted: 0 });
    if (!request) throw new NotFoundException('采购申请单不存在');
    if (request.status !== PurchaseRequestStatus.DRAFT) throw new BadRequestException('只有草稿允许删除');
    request.isDeleted = 1;
    await this.requestRepository.save(request);
  }

  async submit(id: string) {
    return this.changeStatus(
      id,
      [PurchaseRequestStatus.DRAFT, PurchaseRequestStatus.REJECTED],
      PurchaseRequestStatus.SUBMITTED,
      '只有草稿或已驳回采购申请允许提交',
    );
  }

  async approve(id: string, dto: ApprovePurchaseRequestDto = {}) {
    return this.dataSource.transaction(async (manager) => {
      const request = await manager.findOne(PurchaseRequest, {
        where: { id, isDeleted: 0 },
        relations: { entries: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!request) throw new NotFoundException('采购申请单不存在');
      if (request.status !== PurchaseRequestStatus.SUBMITTED) throw new BadRequestException('只有待审核申请允许批准');
      const supplied = new Map((dto.entries || []).map((item) => [item.entryId, Number(item.approveQty)]));
      for (const entry of request.entries.filter((item) => item.isDeleted === 0)) {
        const approveQty = supplied.has(entry.id) ? supplied.get(entry.id) : Number(entry.requestQty);
        if (approveQty < 0 || approveQty > Number(entry.requestQty)) {
          throw new BadRequestException(`申请明细第${entry.lineNo}行批准数量必须在0与申请数量之间`);
        }
        entry.approveQty = approveQty;
      }
      await manager.save(request.entries);
      request.status = PurchaseRequestStatus.APPROVED;
      const first = request.entries[0];
      if (first) request.quantity = Number(first.requestQty);
      await manager.save(request);
      return this.present(request);
    });
  }

  async reject(id: string) {
    return this.changeStatus(id, [PurchaseRequestStatus.SUBMITTED], PurchaseRequestStatus.REJECTED, '只有待审核申请允许驳回');
  }

  async cancel(id: string) {
    const request = await this.findEntityById(id);
    if (!request) throw new NotFoundException('采购申请单不存在');
    if (![PurchaseRequestStatus.DRAFT, PurchaseRequestStatus.SUBMITTED, PurchaseRequestStatus.APPROVED].includes(request.status)) {
      throw new BadRequestException('当前状态不允许取消');
    }
    if (request.entries.some((entry) => Number(entry.purchasedQty || 0) > 0)) {
      throw new BadRequestException('已有下推订单数量的采购申请不允许取消');
    }
    request.status = PurchaseRequestStatus.CANCELED;
    await this.requestRepository.save(request);
    return this.present(request);
  }

  async close(id: string) {
    return this.changeStatus(
      id,
      [PurchaseRequestStatus.APPROVED, PurchaseRequestStatus.FULLY_ORDERED],
      PurchaseRequestStatus.CLOSED,
      '只有已批准或已全部下单的申请允许关闭',
    );
  }

  private async changeStatus(id: string, from: PurchaseRequestStatus[], to: PurchaseRequestStatus, message: string) {
    return this.dataSource.transaction(async (manager: EntityManager) => {
      const request = await manager.findOne(PurchaseRequest, {
        where: { id, isDeleted: 0 },
        relations: { entries: true },
        lock: { mode: 'pessimistic_write' },
      });
      if (!request) throw new NotFoundException('采购申请单不存在');
      if (!from.includes(request.status)) throw new BadRequestException(message);
      if (to === PurchaseRequestStatus.SUBMITTED && !request.entries.some((entry) => entry.isDeleted === 0)) {
        throw new BadRequestException('采购申请至少需要一条有效明细');
      }
      request.status = to;
      await manager.save(request);
      return this.present(request);
    });
  }
}
