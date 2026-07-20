import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { PurchaseReceiveNoticeEntry } from '../../database/entities/purchase-receive-notice-entry.entity';
import { PurchaseReceiveNotice } from '../../database/entities/purchase-receive-notice.entity';
import { QualityInspection } from '../../database/entities/quality-inspection.entity';
import { QualityStandard } from '../../database/entities/quality-standard.entity';
import { generateDocumentNo, PurchaseReceiveNoticeStatus } from '../purchase-common/purchase-status';
import {
  ApproveQualityInspectionDto,
  CreateIncomingInspectionDto,
  UpdateQualityInspectionDto,
} from './dto/quality-inspection.dto';
import {
  QUALITY_INSPECTION_STATUS_META,
  QualityInspectionResult,
  QualityInspectionStatus,
} from './quality-inspection.status';

const QUANTITY_EPSILON = 0.000001;
const INCOMING_INSPECTION_TYPE = 1;
const RECEIVE_NOTICE_SOURCE_TYPE = 'PURCHASE_RECEIVE_NOTICE_ENTRY';

@Injectable()
export class QualityInspectionService {
  constructor(
    @InjectRepository(QualityInspection)
    private readonly qualityInspectionRepository: Repository<QualityInspection>,
    @InjectRepository(QualityStandard)
    private readonly qualityStandardRepository: Repository<QualityStandard>,
    private readonly dataSource: DataSource,
  ) {}

  private present(inspection: QualityInspection) {
    const statusMeta = QUALITY_INSPECTION_STATUS_META[inspection.status] || { code: 'UNKNOWN', name: '未知状态' };
    return {
      ...inspection,
      inspectionQty: Number(inspection.inspectionQty || 0),
      sampleQty: Number(inspection.sampleQty || 0),
      qualifiedQty: Number(inspection.qualifiedQty || 0),
      unqualifiedQty: Number(inspection.unqualifiedQty || 0),
      concessionQty: Number(inspection.concessionQty || 0),
      availableInboundQty: Math.max(
        0,
        Number(inspection.qualifiedQty || 0) + Number(inspection.concessionQty || 0),
      ),
      statusCode: statusMeta.code,
      statusName: statusMeta.name,
    };
  }

  async findAll(page = 1, pageSize = 20, inspectionNo?: string, materialCode?: string, inspectionType?: number) {
    const query = this.qualityInspectionRepository.createQueryBuilder('qi')
      .where('qi.isDeleted = 0');

    if (inspectionNo) query.andWhere('qi.inspectionNo LIKE :inspectionNo', { inspectionNo: `%${inspectionNo}%` });
    if (materialCode) query.andWhere('qi.materialCode LIKE :materialCode', { materialCode: `%${materialCode}%` });
    if (inspectionType !== undefined) query.andWhere('qi.inspectionType = :inspectionType', { inspectionType });

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('qi.createdAt', 'DESC')
      .getManyAndCount();

    return { list: list.map((item) => this.present(item)), total, page, pageSize };
  }

  async findById(id: string) {
    const inspection = await this.qualityInspectionRepository.findOne({ where: { id, isDeleted: 0 } });
    return inspection ? this.present(inspection) : null;
  }

  private async findEntityById(id: string, manager?: EntityManager, lock = false) {
    const repository = manager ? manager.getRepository(QualityInspection) : this.qualityInspectionRepository;
    return repository.findOne({
      where: { id, isDeleted: 0 },
      ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}),
    });
  }

  async findByType(inspectionType: number, page = 1, pageSize = 20) {
    const [list, total] = await this.qualityInspectionRepository.findAndCount({
      where: { inspectionType, isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list: list.map((item) => this.present(item)), total, page, pageSize };
  }

  async findByResult(result: number, page = 1, pageSize = 20) {
    const [list, total] = await this.qualityInspectionRepository.findAndCount({
      where: { result, isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list: list.map((item) => this.present(item)), total, page, pageSize };
  }

  async findBySource(sourceType: string, sourceId: string) {
    const list = await this.qualityInspectionRepository.find({
      where: { sourceType, sourceId, isDeleted: 0 },
      order: { createdAt: 'DESC' },
    });
    return list.map((item) => this.present(item));
  }

  private validateQuantities(inspection: QualityInspection, requireComplete: boolean) {
    const inspectionQty = Number(inspection.inspectionQty || 0);
    const sampleQty = Number(inspection.sampleQty || 0);
    const qualifiedQty = Number(inspection.qualifiedQty || 0);
    const unqualifiedQty = Number(inspection.unqualifiedQty || 0);
    const concessionQty = Number(inspection.concessionQty || 0);

    if (inspectionQty <= QUANTITY_EPSILON) throw new BadRequestException('检验数量必须大于0');
    if ([sampleQty, qualifiedQty, unqualifiedQty, concessionQty].some((qty) => qty < -QUANTITY_EPSILON)) {
      throw new BadRequestException('检验结果数量不能为负数');
    }
    if (sampleQty - inspectionQty > QUANTITY_EPSILON) throw new BadRequestException('抽样数量不能大于检验数量');
    if (concessionQty - unqualifiedQty > QUANTITY_EPSILON) {
      throw new BadRequestException('让步接收数量必须是不合格数量的子集');
    }
    const resultQty = qualifiedQty + unqualifiedQty;
    if (resultQty - inspectionQty > QUANTITY_EPSILON) throw new BadRequestException('合格数量与不合格数量之和不能大于检验数量');
    if (requireComplete && Math.abs(resultQty - inspectionQty) > QUANTITY_EPSILON) {
      throw new BadRequestException('提交或审批前，检验数量必须等于合格数量与不合格数量之和');
    }
  }

  private async assertIncomingSourceAvailable(inspection: QualityInspection, manager: EntityManager) {
    if (!inspection.sourceReceiveNoticeEntryId) return null;
    const entry = await manager.findOne(PurchaseReceiveNoticeEntry, {
      where: { id: inspection.sourceReceiveNoticeEntryId, isDeleted: 0 },
      lock: { mode: 'pessimistic_write' },
    });
    if (!entry) throw new BadRequestException('来源收料通知明细不存在');
    const notice = await manager.findOne(PurchaseReceiveNotice, {
      where: { id: entry.purchaseReceiveNoticeId, isDeleted: 0 },
      lock: { mode: 'pessimistic_write' },
    });
    if (!notice) throw new BadRequestException('来源收料通知不存在');
    if (notice.status !== PurchaseReceiveNoticeStatus.APPROVED) {
      throw new BadRequestException('只有已审核且未关闭的收料通知允许进行来料检验');
    }
    if (!notice.needCheck || !entry.checkIncoming) throw new BadRequestException('该收料明细为免检，不应生成来料检验单');
    const remaining = Number(entry.receiveQty) - Number(entry.inspectedQty || 0);
    if (Number(inspection.inspectionQty) - remaining > QUANTITY_EPSILON) {
      throw new BadRequestException(`来源收料明细剩余可检数量为 ${Math.max(0, remaining)}`);
    }
    return { entry, notice };
  }

  async createIncoming(dto: CreateIncomingInspectionDto) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const existing = await manager.findOne(QualityInspection, {
          where: { sourceReceiveNoticeEntryId: dto.receiveNoticeEntryId, isDeleted: 0 },
          lock: { mode: 'pessimistic_write' },
        });
        if (existing) return this.present(existing);

        const entry = await manager.findOne(PurchaseReceiveNoticeEntry, {
          where: { id: dto.receiveNoticeEntryId, isDeleted: 0 },
          lock: { mode: 'pessimistic_write' },
        });
        if (!entry) throw new NotFoundException('收料通知明细不存在');
        const notice = await manager.findOne(PurchaseReceiveNotice, {
          where: { id: entry.purchaseReceiveNoticeId, isDeleted: 0 },
          lock: { mode: 'pessimistic_write' },
        });
        if (!notice) throw new NotFoundException('收料通知不存在');
        if (notice.status !== PurchaseReceiveNoticeStatus.APPROVED) {
          throw new BadRequestException('只有已审核且未关闭的收料通知允许下推来料检验单');
        }
        if (!notice.needCheck || !entry.checkIncoming) throw new BadRequestException('该收料明细为免检，无需生成来料检验单');
        const remaining = Number(entry.receiveQty) - Number(entry.inspectedQty || 0);
        if (remaining <= QUANTITY_EPSILON) throw new BadRequestException('该收料明细已无待检数量');

        const inspection = manager.create(QualityInspection, {
          inspectionNo: generateDocumentNo('QI'),
          inspectionType: INCOMING_INSPECTION_TYPE,
          sourceType: RECEIVE_NOTICE_SOURCE_TYPE,
          sourceId: entry.id,
          sourceReceiveNoticeId: notice.id,
          sourceReceiveNoticeNo: notice.noticeNo,
          sourceReceiveNoticeEntryId: entry.id,
          materialId: entry.materialId,
          materialCode: entry.materialCode,
          materialName: entry.materialName,
          supplierId: notice.supplierId,
          batchNo: entry.supplierLot,
          inspectionQty: remaining,
          sampleQty: 0,
          qualifiedQty: 0,
          unqualifiedQty: 0,
          concessionQty: 0,
          inspectionDate: new Date(),
          result: QualityInspectionResult.PENDING,
          status: QualityInspectionStatus.DRAFT,
          isDeleted: 0,
        });
        return this.present(await manager.save(inspection));
      });
    } catch (error) {
      const existing = await this.qualityInspectionRepository.findOne({
        where: { sourceReceiveNoticeEntryId: dto.receiveNoticeEntryId, isDeleted: 0 },
      });
      if (existing) return this.present(existing);
      throw error;
    }
  }

  async create(data: Partial<QualityInspection>) {
    const inspection = this.qualityInspectionRepository.create({
      ...data,
      inspectionNo: generateDocumentNo('QI'),
      result: QualityInspectionResult.PENDING,
      status: QualityInspectionStatus.DRAFT,
      resultAppliedAt: null,
      inspectionDate: data.inspectionDate || new Date(),
      isDeleted: 0,
    });
    return this.present(await this.qualityInspectionRepository.save(inspection));
  }

  async update(id: string, dto: UpdateQualityInspectionDto) {
    return this.dataSource.transaction(async (manager) => {
      const inspection = await this.findEntityById(id, manager, true);
      if (!inspection) throw new NotFoundException('质量检验单不存在');
      if (![QualityInspectionStatus.DRAFT, QualityInspectionStatus.REJECTED].includes(inspection.status)) {
        throw new BadRequestException('只有草稿或已驳回检验单允许修改');
      }

      if (dto.inspectionQty !== undefined) inspection.inspectionQty = dto.inspectionQty;
      if (dto.sampleQty !== undefined) inspection.sampleQty = dto.sampleQty;
      if (dto.qualifiedQty !== undefined) inspection.qualifiedQty = dto.qualifiedQty;
      if (dto.unqualifiedQty !== undefined) inspection.unqualifiedQty = dto.unqualifiedQty;
      if (dto.concessionQty !== undefined) inspection.concessionQty = dto.concessionQty;
      if (dto.inspector !== undefined) inspection.inspector = dto.inspector;
      if (dto.inspectionDate !== undefined) inspection.inspectionDate = new Date(dto.inspectionDate);
      if (dto.batchNo !== undefined) inspection.batchNo = dto.batchNo;
      if (dto.remark !== undefined) inspection.remark = dto.remark;

      this.validateQuantities(inspection, false);
      await this.assertIncomingSourceAvailable(inspection, manager);
      return this.present(await manager.save(inspection));
    });
  }

  async remove(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const inspection = await this.findEntityById(id, manager, true);
      if (!inspection) throw new NotFoundException('质量检验单不存在');
      if (inspection.sourceReceiveNoticeEntryId) throw new BadRequestException('标准采购来料检验单不允许删除，可驳回后修改并重新提交');
      if (inspection.status !== QualityInspectionStatus.DRAFT) throw new BadRequestException('只有草稿检验单允许删除');
      inspection.isDeleted = 1;
      await manager.save(inspection);
    });
  }

  async submit(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const inspection = await this.findEntityById(id, manager, true);
      if (!inspection) throw new NotFoundException('质量检验单不存在');
      if (![QualityInspectionStatus.DRAFT, QualityInspectionStatus.REJECTED].includes(inspection.status)) {
        throw new BadRequestException('只有草稿或已驳回检验单允许提交');
      }
      this.validateQuantities(inspection, true);
      await this.assertIncomingSourceAvailable(inspection, manager);
      inspection.status = QualityInspectionStatus.SUBMITTED;
      inspection.result = QualityInspectionResult.PENDING;
      inspection.approvedAt = null;
      inspection.approvedBy = null;
      return this.present(await manager.save(inspection));
    });
  }

  async approve(id: string, dto: ApproveQualityInspectionDto = {}) {
    return this.dataSource.transaction(async (manager) => {
      const inspection = await this.findEntityById(id, manager, true);
      if (!inspection) throw new NotFoundException('质量检验单不存在');
      if (inspection.status === QualityInspectionStatus.APPROVED && inspection.resultAppliedAt) {
        return this.present(inspection);
      }
      if (inspection.status !== QualityInspectionStatus.SUBMITTED) throw new BadRequestException('只有待审核检验单允许审核');
      this.validateQuantities(inspection, true);

      const source = await this.assertIncomingSourceAvailable(inspection, manager);
      if (source) {
        source.entry.inspectedQty = Number(source.entry.inspectedQty || 0) + Number(inspection.inspectionQty);
        source.entry.qualifiedQty = Number(source.entry.qualifiedQty || 0) + Number(inspection.qualifiedQty || 0);
        source.entry.unqualifiedQty = Number(source.entry.unqualifiedQty || 0) + Number(inspection.unqualifiedQty || 0);
        source.entry.concessionQty = Number(source.entry.concessionQty || 0) + Number(inspection.concessionQty || 0);
        await manager.save(source.entry);
      }

      inspection.result = Number(inspection.concessionQty || 0) > QUANTITY_EPSILON
        ? QualityInspectionResult.CONCESSION_ACCEPTED
        : Number(inspection.unqualifiedQty || 0) > QUANTITY_EPSILON
          ? QualityInspectionResult.UNQUALIFIED
          : QualityInspectionResult.QUALIFIED;
      inspection.status = QualityInspectionStatus.APPROVED;
      inspection.approvedBy = dto.approvedBy || null;
      inspection.approvedAt = new Date();
      inspection.resultAppliedAt = new Date();
      return this.present(await manager.save(inspection));
    });
  }

  async reject(id: string) {
    return this.dataSource.transaction(async (manager) => {
      const inspection = await this.findEntityById(id, manager, true);
      if (!inspection) throw new NotFoundException('质量检验单不存在');
      if (inspection.status !== QualityInspectionStatus.SUBMITTED) throw new BadRequestException('只有待审核检验单允许驳回');
      inspection.status = QualityInspectionStatus.REJECTED;
      inspection.result = QualityInspectionResult.PENDING;
      inspection.approvedAt = null;
      inspection.approvedBy = null;
      return this.present(await manager.save(inspection));
    });
  }

  async getStatistics(inspectionType?: number, period?: string) {
    const query = this.qualityInspectionRepository.createQueryBuilder('qi')
      .where('qi.isDeleted = 0');
    if (inspectionType !== undefined) query.andWhere('qi.inspectionType = :inspectionType', { inspectionType });
    if (period === 'month') {
      const now = new Date();
      query.andWhere('qi.inspectionDate >= :start', { start: new Date(now.getFullYear(), now.getMonth(), 1) });
    } else if (period === 'quarter') {
      const now = new Date();
      query.andWhere('qi.inspectionDate >= :start', { start: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1) });
    }

    const total = await query.clone().getCount();
    const byResult = await query.clone()
      .select('qi.result', 'result')
      .addSelect('COUNT(*)', 'count')
      .groupBy('qi.result')
      .getRawMany();
    const qty = await query.clone()
      .select('COALESCE(SUM(qi.qualified_qty), 0)', 'qualifiedQty')
      .addSelect('COALESCE(SUM(qi.unqualified_qty), 0)', 'unqualifiedQty')
      .getRawOne();
    const qualifiedCount = Number(byResult.find((item) => Number(item.result) === QualityInspectionResult.QUALIFIED)?.count || 0);
    return {
      totalInspections: total,
      passRate: total > 0 ? Number(((qualifiedCount / total) * 100).toFixed(2)) : 0,
      totalQualifiedQty: Number(qty.qualifiedQty || 0),
      totalUnqualifiedQty: Number(qty.unqualifiedQty || 0),
      byResult: byResult.map((item) => ({ result: Number(item.result), count: Number(item.count) })),
    };
  }
}
