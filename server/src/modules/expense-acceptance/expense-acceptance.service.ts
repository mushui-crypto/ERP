import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import { DataSource, EntityManager } from 'typeorm';
import { ExpenseAcceptanceEntry } from '../../database/entities/expense-acceptance-entry.entity';
import { ExpenseAcceptance } from '../../database/entities/expense-acceptance.entity';
import { PurchaseOrder } from '../../database/entities/purchase-order.entity';
import { PurchaseReceiveNoticeEntry } from '../../database/entities/purchase-receive-notice-entry.entity';
import { PurchaseReceiveNotice } from '../../database/entities/purchase-receive-notice.entity';
import { PayableService } from '../payable/payable.service';
import {
  PurchaseBusinessType,
  PurchaseReceiveNoticeStatus,
  generateDocumentNo,
  withStatusMeta,
} from '../purchase-common/purchase-status';
import {
  ApproveExpenseAcceptanceDto,
  CreateExpenseAcceptanceDto,
  ExpenseAcceptanceLineDto,
  UpdateExpenseAcceptanceDto,
} from './dto/expense-acceptance.dto';
import {
  EXPENSE_ACCEPTANCE_STATUS_META,
  ExpenseAcceptanceStatus,
  ExpensePayableGenerationStatus,
} from './expense-acceptance.status';

const QUANTITY_EPSILON = 0.000001;
const ACTIVE_OCCUPATION_STATUSES = [
  ExpenseAcceptanceStatus.DRAFT,
  ExpenseAcceptanceStatus.SUBMITTED,
];

@Injectable()
export class ExpenseAcceptanceService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly payableService: PayableService,
  ) {}

  private present(entity: ExpenseAcceptance) {
    return withStatusMeta({
      ...entity,
      amount: Number(entity.amount || 0),
      taxAmount: Number(entity.taxAmount || 0),
      totalAmount: Number(entity.totalAmount || 0),
      entries: (entity.entries || [])
        .filter((entry) => entry.isDeleted === 0)
        .sort((left, right) => left.lineNo - right.lineNo)
        .map((entry) => ({
          ...entry,
          acceptanceQty: Number(entry.acceptanceQty),
          unitPrice: Number(entry.unitPrice),
          taxRate: Number(entry.taxRate || 0),
          amount: Number(entry.amount || 0),
          taxAmount: Number(entry.taxAmount || 0),
          totalAmount: Number(entry.totalAmount || 0),
        })),
    }, EXPENSE_ACCEPTANCE_STATUS_META);
  }

  async findAll(page: number, pageSize: number, status?: number) {
    const query = this.dataSource.getRepository(ExpenseAcceptance)
      .createQueryBuilder('acceptance')
      .leftJoinAndSelect('acceptance.entries', 'entry', 'entry.isDeleted = 0')
      .where('acceptance.isDeleted = 0');
    if (status !== undefined) query.andWhere('acceptance.status = :status', { status });
    const [list, total] = await query
      .orderBy('acceptance.createdAt', 'DESC')
      .addOrderBy('entry.lineNo', 'ASC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();
    return { list: list.map((item) => this.present(item)), total, page, pageSize };
  }

  private findEntity(id: string, manager?: EntityManager, lock = false) {
    const repository = manager
      ? manager.getRepository(ExpenseAcceptance)
      : this.dataSource.getRepository(ExpenseAcceptance);
    return repository.findOne({
      where: { id, isDeleted: 0 },
      relations: { entries: true },
      order: { entries: { lineNo: 'ASC' } },
      ...(lock ? { lock: { mode: 'pessimistic_write' as const } } : {}),
    });
  }

  async findById(id: string) {
    const entity = await this.findEntity(id);
    return entity ? this.present(entity) : null;
  }

  async createFromReceiveNotice(dto: CreateExpenseAcceptanceDto) {
    const payloadHash = this.calculatePayloadHash(dto);
    const repository = this.dataSource.getRepository(ExpenseAcceptance);
    const existing = await repository.findOne({
      where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 },
      relations: { entries: true },
    });
    if (existing) return this.assertIdempotent(existing, payloadHash);

    try {
      return await this.dataSource.transaction(async (manager) => {
        const concurrent = await manager.findOne(ExpenseAcceptance, {
          where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 },
          relations: { entries: true },
          lock: { mode: 'pessimistic_write' },
        });
        if (concurrent) return this.assertIdempotent(concurrent, payloadHash);

        const context = await this.loadSourceContext(dto, manager);
        const entity = manager.create(ExpenseAcceptance, {
          acceptanceNo: generateDocumentNo('EA'),
          idempotencyKey: dto.idempotencyKey,
          payloadHash,
          businessType: PurchaseBusinessType.EXPENSE_PURCHASE,
          sourceReceiveNoticeId: context.notice.id,
          sourceReceiveNoticeNo: context.notice.noticeNo,
          orgId: context.notice.purchaseOrgId,
          purchaseOrgId: context.notice.purchaseOrgId,
          settleOrgId: dto.settleOrgId,
          supplierId: context.notice.supplierId,
          currencyId: context.order.currencyId,
          paymentTermId: context.order.paymentTermId,
          acceptanceDate: dto.acceptanceDate ? new Date(dto.acceptanceDate) : new Date(),
          departmentId: dto.departmentId || null,
          acceptorId: dto.acceptorId || null,
          amount: 0,
          taxAmount: 0,
          totalAmount: 0,
          status: ExpenseAcceptanceStatus.DRAFT,
          payableGenerationStatus: ExpensePayableGenerationStatus.NOT_GENERATED,
          remark: dto.remark || null,
        });
        await manager.save(entity);
        entity.entries = await manager.save(context.entries.map((entry, index) =>
          manager.create(ExpenseAcceptanceEntry, {
            ...entry,
            expenseAcceptanceId: entity.id,
            lineNo: index + 1,
          }),
        ));
        this.applyTotals(entity);
        await manager.save(entity);
        return this.present(entity);
      });
    } catch (error) {
      const concurrent = await repository.findOne({
        where: { idempotencyKey: dto.idempotencyKey, isDeleted: 0 },
        relations: { entries: true },
      });
      if (concurrent) return this.assertIdempotent(concurrent, payloadHash);
      throw error;
    }
  }

  private async loadSourceContext(
    dto: CreateExpenseAcceptanceDto,
    manager: EntityManager,
    excludeAcceptanceId?: string,
  ) {
    const notice = await manager.findOne(PurchaseReceiveNotice, {
      where: { id: dto.sourceId, isDeleted: 0 },
      relations: { entries: true },
      lock: { mode: 'pessimistic_write' },
    });
    if (!notice) throw new NotFoundException('来源服务完成记录不存在');
    if (notice.status !== PurchaseReceiveNoticeStatus.APPROVED) {
      throw new BadRequestException('只有已审核服务完成记录允许生成费用验收');
    }
    if (notice.businessType !== PurchaseBusinessType.EXPENSE_PURCHASE) {
      throw new BadRequestException('来源收料通知不是费用采购服务完成记录');
    }
    const order = await manager.findOne(PurchaseOrder, {
      where: { id: notice.purchaseOrderId, isDeleted: 0 },
      lock: { mode: 'pessimistic_read' },
    });
    if (!order) throw new BadRequestException('来源费用采购订单不存在');
    if (!order.currencyId || !order.paymentTermId) {
      throw new BadRequestException('费用采购订单缺少币种或付款条件');
    }
    const sourceById = new Map(
      notice.entries
        .filter((entry) => entry.isDeleted === 0)
        .map((entry) => [entry.id, entry]),
    );
    const entries = await this.resolveLines(
      dto.entries,
      sourceById,
      notice,
      manager,
      excludeAcceptanceId,
    );
    return { notice, order, entries };
  }

  private async resolveLines(
    lines: ExpenseAcceptanceLineDto[],
    sourceById: Map<string, PurchaseReceiveNoticeEntry>,
    notice: PurchaseReceiveNotice,
    manager: EntityManager,
    excludeAcceptanceId?: string,
  ) {
    if (new Set(lines.map((line) => line.sourceEntryId)).size !== lines.length) {
      throw new BadRequestException('费用验收来源明细不能重复');
    }
    const entries: Partial<ExpenseAcceptanceEntry>[] = [];
    for (const line of lines) {
      const source = sourceById.get(line.sourceEntryId);
      if (!source) throw new BadRequestException(`来源服务完成明细不存在: ${line.sourceEntryId}`);
      if (!source.expenseItemName) throw new BadRequestException('来源服务完成明细缺少费用项目名称');
      const acceptedQty = Number(source.expenseAcceptedQty || 0);
      const occupiedQty = await this.activeOccupation(
        source.id,
        manager,
        excludeAcceptanceId,
      );
      const availableQty = this.round(
        Number(source.receiveQty) - acceptedQty - occupiedQty,
        4,
      );
      if (Number(line.acceptanceQty) - availableQty > QUANTITY_EPSILON) {
        throw new BadRequestException(
          `服务完成明细可验收数量为 ${Math.max(0, availableQty)}，本次为 ${line.acceptanceQty}`,
        );
      }
      const acceptanceQty = Number(line.acceptanceQty);
      const unitPrice = Number(source.unitPrice || 0);
      const taxRate = Number(source.taxRate || 0);
      const amount = this.round(acceptanceQty * unitPrice, 2);
      const taxAmount = this.round(amount * taxRate / 100, 2);
      entries.push({
        sourceReceiveNoticeId: notice.id,
        sourceReceiveNoticeEntryId: source.id,
        sourceOrderId: source.sourceOrderId,
        sourceOrderEntryId: source.sourceOrderEntryId,
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
        acceptanceQty,
        unitPrice,
        taxRate,
        amount,
        taxAmount,
        totalAmount: this.round(amount + taxAmount, 2),
        departmentId: line.departmentId || null,
        remark: line.remark || null,
      });
    }
    return entries;
  }

  private async activeOccupation(
    sourceEntryId: string,
    manager: EntityManager,
    excludeAcceptanceId?: string,
  ) {
    const query = manager.getRepository(ExpenseAcceptanceEntry)
      .createQueryBuilder('entry')
      .innerJoin(
        ExpenseAcceptance,
        'header',
        'header.id = entry.expenseAcceptanceId',
      )
      .select('COALESCE(SUM(entry.acceptanceQty), 0)', 'quantity')
      .where('entry.sourceReceiveNoticeEntryId = :sourceEntryId', { sourceEntryId })
      .andWhere('entry.isDeleted = 0')
      .andWhere('header.isDeleted = 0')
      .andWhere('header.status IN (:...statuses)', {
        statuses: ACTIVE_OCCUPATION_STATUSES,
      });
    if (excludeAcceptanceId) {
      query.andWhere('header.id <> :excludeAcceptanceId', { excludeAcceptanceId });
    }
    return Number((await query.getRawOne())?.quantity || 0);
  }

  async update(id: string, dto: UpdateExpenseAcceptanceDto) {
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntity(id, manager, true);
      if (!entity) throw new NotFoundException('费用验收单不存在');
      if (![ExpenseAcceptanceStatus.DRAFT, ExpenseAcceptanceStatus.REJECTED].includes(entity.status)) {
        throw new BadRequestException('只有草稿或已驳回费用验收允许修改');
      }
      entity.acceptanceDate = dto.acceptanceDate
        ? new Date(dto.acceptanceDate)
        : entity.acceptanceDate;
      entity.departmentId = dto.departmentId ?? entity.departmentId;
      entity.acceptorId = dto.acceptorId ?? entity.acceptorId;
      entity.remark = dto.remark ?? entity.remark;
      if (dto.entries) {
        const context = await this.loadSourceContext({
          idempotencyKey: entity.idempotencyKey,
          sourceId: entity.sourceReceiveNoticeId,
          settleOrgId: entity.settleOrgId,
          acceptanceDate: entity.acceptanceDate.toISOString(),
          departmentId: entity.departmentId,
          acceptorId: entity.acceptorId,
          remark: entity.remark,
          entries: dto.entries,
        }, manager, entity.id);
        for (const old of entity.entries.filter((entry) => entry.isDeleted === 0)) {
          old.isDeleted = 1;
          await manager.save(old);
        }
        entity.entries = await manager.save(context.entries.map((entry, index) =>
          manager.create(ExpenseAcceptanceEntry, {
            ...entry,
            expenseAcceptanceId: entity.id,
            lineNo: index + 1,
          }),
        ));
        this.applyTotals(entity);
      }
      await manager.save(entity);
      return this.present(entity);
    });
  }

  submit(id: string) {
    return this.changeStatus(
      id,
      [ExpenseAcceptanceStatus.DRAFT, ExpenseAcceptanceStatus.REJECTED],
      ExpenseAcceptanceStatus.SUBMITTED,
      '只有草稿或已驳回费用验收允许提交',
    );
  }

  reject(id: string) {
    return this.changeStatus(
      id,
      [ExpenseAcceptanceStatus.SUBMITTED],
      ExpenseAcceptanceStatus.REJECTED,
      '只有待审核费用验收允许驳回',
    );
  }

  cancel(id: string) {
    return this.changeStatus(
      id,
      [
        ExpenseAcceptanceStatus.DRAFT,
        ExpenseAcceptanceStatus.SUBMITTED,
        ExpenseAcceptanceStatus.REJECTED,
      ],
      ExpenseAcceptanceStatus.CANCELED,
      '当前费用验收状态不允许取消',
    );
  }

  async approve(id: string, dto: ApproveExpenseAcceptanceDto) {
    const approved = await this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntity(id, manager, true);
      if (!entity) throw new NotFoundException('费用验收单不存在');
      if (entity.status !== ExpenseAcceptanceStatus.SUBMITTED) {
        throw new BadRequestException('只有待审核费用验收允许审核');
      }
      for (const entry of entity.entries.filter((item) => item.isDeleted === 0)) {
        const source = await manager.findOne(PurchaseReceiveNoticeEntry, {
          where: {
            id: entry.sourceReceiveNoticeEntryId,
            purchaseReceiveNoticeId: entity.sourceReceiveNoticeId,
            isDeleted: 0,
          },
          lock: { mode: 'pessimistic_write' },
        });
        if (!source) throw new BadRequestException('费用验收来源服务完成明细不存在');
        const availableQty = this.round(
          Number(source.receiveQty) - Number(source.expenseAcceptedQty || 0),
          4,
        );
        if (Number(entry.acceptanceQty) - availableQty > QUANTITY_EPSILON) {
          throw new BadRequestException(
            `服务完成明细剩余可验收数量为 ${Math.max(0, availableQty)}`,
          );
        }
        source.expenseAcceptedQty = this.round(
          Number(source.expenseAcceptedQty || 0) + Number(entry.acceptanceQty),
          4,
        );
        await manager.save(source);
      }
      entity.status = ExpenseAcceptanceStatus.APPROVED;
      entity.approvedAt = new Date();
      entity.approvedBy = dto.approvedBy || null;
      await manager.save(entity);
      return entity;
    });
    return this.generateEstimatedPayable(approved.id);
  }

  async generateEstimatedPayable(id: string) {
    try {
      return await this.dataSource.transaction(async (manager) => {
        const entity = await this.findEntity(id, manager, true);
        if (!entity) throw new NotFoundException('费用验收单不存在');
        if (entity.status !== ExpenseAcceptanceStatus.APPROVED) {
          throw new BadRequestException('只有已审核费用验收允许生成暂估应付');
        }
        if (
          entity.payableGenerationStatus === ExpensePayableGenerationStatus.GENERATED
          && entity.payableId
        ) {
          return this.present(entity);
        }
        const payable = await this.payableService.createEstimatedPayableFromExpenseAcceptance({
          expenseAcceptanceId: entity.id,
          expenseAcceptanceNo: entity.acceptanceNo,
          supplierId: entity.supplierId,
          currencyId: entity.currencyId,
          settleOrgId: entity.settleOrgId,
          paymentTermId: entity.paymentTermId,
          approvedAt: entity.approvedAt,
          createdBy: entity.approvedBy,
          entries: entity.entries
            .filter((entry) => entry.isDeleted === 0)
            .map((entry) => ({
              expenseAcceptanceEntryId: entry.id,
              sourceReceiveNoticeEntryId: entry.sourceReceiveNoticeEntryId,
              sourceOrderEntryId: entry.sourceOrderEntryId,
              sourceRequestEntryId: entry.sourceRequestEntryId,
              expenseItemCode: entry.expenseItemCode,
              expenseItemName: entry.expenseItemName,
              materialId: entry.materialId,
              materialCode: entry.materialCode,
              materialName: entry.materialName,
              materialModel: entry.materialModel,
              unitId: entry.unitId,
              unitCode: entry.unitCode,
              unitName: entry.unitName,
              quantity: Number(entry.acceptanceQty),
              unitPrice: Number(entry.unitPrice),
              taxRate: Number(entry.taxRate),
              untaxedAmount: Number(entry.amount),
              taxAmount: Number(entry.taxAmount),
              totalAmount: Number(entry.totalAmount),
            })),
        }, manager);
        entity.payableGenerationStatus = ExpensePayableGenerationStatus.GENERATED;
        entity.payableId = payable.id;
        entity.payableNo = payable.payableNo;
        entity.payableGeneratedAt = new Date();
        entity.payableGenerationError = null;
        entity.payableGenerationFailedAt = null;
        return this.present(await manager.save(entity));
      });
    } catch (error) {
      return this.recordPayableFailure(id, error);
    }
  }

  private async recordPayableFailure(id: string, error: unknown) {
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntity(id, manager, true);
      if (!entity) throw error;
      if (
        entity.status !== ExpenseAcceptanceStatus.APPROVED
        || entity.payableGenerationStatus === ExpensePayableGenerationStatus.GENERATED
      ) {
        throw error;
      }
      entity.payableGenerationStatus = ExpensePayableGenerationStatus.FAILED;
      entity.payableGenerationError = (
        error instanceof Error ? error.message : String(error)
      ).slice(0, 1000);
      entity.payableGenerationFailedAt = new Date();
      return this.present(await manager.save(entity));
    });
  }

  private changeStatus(
    id: string,
    from: ExpenseAcceptanceStatus[],
    to: ExpenseAcceptanceStatus,
    message: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      const entity = await this.findEntity(id, manager, true);
      if (!entity) throw new NotFoundException('费用验收单不存在');
      if (!from.includes(entity.status)) throw new BadRequestException(message);
      entity.status = to;
      await manager.save(entity);
      return this.present(entity);
    });
  }

  private applyTotals(entity: ExpenseAcceptance) {
    entity.amount = this.round(
      entity.entries.reduce((sum, entry) => sum + Number(entry.amount || 0), 0),
      2,
    );
    entity.taxAmount = this.round(
      entity.entries.reduce((sum, entry) => sum + Number(entry.taxAmount || 0), 0),
      2,
    );
    entity.totalAmount = this.round(
      entity.entries.reduce((sum, entry) => sum + Number(entry.totalAmount || 0), 0),
      2,
    );
  }

  private calculatePayloadHash(dto: CreateExpenseAcceptanceDto) {
    const normalized = {
      sourceId: dto.sourceId,
      settleOrgId: dto.settleOrgId,
      acceptanceDate: dto.acceptanceDate || null,
      departmentId: dto.departmentId || null,
      acceptorId: dto.acceptorId || null,
      remark: dto.remark || null,
      entries: [...dto.entries]
        .map((entry) => ({
          sourceEntryId: entry.sourceEntryId,
          acceptanceQty: this.round(Number(entry.acceptanceQty), 4),
          departmentId: entry.departmentId || null,
          remark: entry.remark || null,
        }))
        .sort((left, right) => left.sourceEntryId.localeCompare(right.sourceEntryId)),
    };
    return createHash('sha256').update(JSON.stringify(normalized)).digest('hex');
  }

  private assertIdempotent(
    entity: ExpenseAcceptance,
    payloadHash: string,
  ) {
    if (entity.payloadHash !== payloadHash) {
      throw new BadRequestException('幂等键已被不同请求载荷使用');
    }
    return this.present(entity);
  }

  private round(value: number, scale: number) {
    const factor = 10 ** scale;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }
}
