import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { InventoryPosting } from '../../database/entities/inventory-posting.entity';
import { Inventory } from '../../database/entities/inventory.entity';
import { CreateInventoryDto, InventoryAdjustDto, UpdateInventoryDto } from './dto/inventory.dto';

export interface PostPurchaseInboundInput {
  sourceId: string;
  sourceEntryId: string;
  warehouseId: string;
  materialId: string;
  batchNo?: string;
  quantity: number;
  amount: number;
  inboundDate: Date;
  expiryDate?: Date;
}

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepository: Repository<Inventory>,
    @InjectRepository(InventoryPosting)
    private readonly postingRepository: Repository<InventoryPosting>,
  ) {}

  private buildDimensionKey(warehouseId: string, materialId: string, batchNo?: string) {
    return `${warehouseId}::${materialId}::${batchNo || ''}`;
  }

  private round(value: number, scale: number) {
    const factor = 10 ** scale;
    return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
  }

  async findAll(page = 1, pageSize = 20, warehouseId?: string, materialId?: string) {
    const where: any = { isDeleted: 0 };
    if (warehouseId) where.warehouseId = warehouseId;
    if (materialId) where.materialId = materialId;
    const [list, total] = await this.inventoryRepository.findAndCount({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Inventory | null> {
    return this.inventoryRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByWarehouse(warehouseId: string): Promise<Inventory[]> {
    return this.inventoryRepository.find({ where: { warehouseId, isDeleted: 0 } });
  }

  async findByMaterial(materialId: string): Promise<Inventory[]> {
    return this.inventoryRepository.find({ where: { materialId, isDeleted: 0 } });
  }

  async create(dto: CreateInventoryDto): Promise<Inventory> {
    const quantity = Number(dto.quantity || 0);
    const lockedQty = Number(dto.lockedQty || 0);
    const unitCost = Number(dto.unitCost || 0);
    const batchNo = dto.batchNo || '';
    const inventory = this.inventoryRepository.create({
      ...dto,
      batchNo,
      dimensionKey: this.buildDimensionKey(dto.warehouseId, dto.materialId, batchNo),
      quantity,
      lockedQty,
      availableQty: dto.availableQty === undefined ? quantity - lockedQty : Number(dto.availableQty),
      status: dto.status === undefined ? 1 : dto.status,
      unitCost,
      totalCost: dto.totalCost === undefined ? this.round(quantity * unitCost, 2) : Number(dto.totalCost),
    });
    return this.inventoryRepository.save(inventory);
  }

  async update(id: string, dto: UpdateInventoryDto): Promise<Inventory> {
    const inventory = await this.findById(id);
    if (!inventory) throw new NotFoundException('库存记录不存在');

    Object.assign(inventory, dto);
    inventory.batchNo = inventory.batchNo || '';
    inventory.dimensionKey = this.buildDimensionKey(inventory.warehouseId, inventory.materialId, inventory.batchNo);
    inventory.availableQty = Number(inventory.quantity) - Number(inventory.lockedQty);
    inventory.totalCost = this.round(Number(inventory.quantity) * Number(inventory.unitCost), 2);
    return this.inventoryRepository.save(inventory);
  }

  async remove(id: string): Promise<void> {
    const inventory = await this.findById(id);
    if (!inventory) throw new NotFoundException('库存记录不存在');
    inventory.isDeleted = 1;
    await this.inventoryRepository.save(inventory);
  }

  async adjustStock(id: string, dto: InventoryAdjustDto): Promise<Inventory> {
    const inventory = await this.findById(id);
    if (!inventory) throw new NotFoundException('库存记录不存在');

    const adjustQty = Number(dto.adjustQty);
    if (dto.adjustType === 2 && Number(inventory.availableQty) < adjustQty) {
      throw new BadRequestException('可用库存不足');
    }

    inventory.quantity = Number(inventory.quantity) + adjustQty;
    inventory.availableQty = Number(inventory.quantity) - Number(inventory.lockedQty);
    inventory.totalCost = this.round(Number(inventory.quantity) * Number(inventory.unitCost), 2);
    return this.inventoryRepository.save(inventory);
  }

  /**
   * 标准采购入库专用库存过账接口。调用方必须传入同一事务的 EntityManager。
   * sourceEntryId 唯一，重复调用直接返回原过账记录。
   */
  async postPurchaseInbound(input: PostPurchaseInboundInput, manager: EntityManager): Promise<InventoryPosting> {
    const postingRepository = manager.getRepository(InventoryPosting);
    const inventoryRepository = manager.getRepository(Inventory);
    const existingPosting = await postingRepository.findOne({
      where: { sourceType: 'PURCHASE_INBOUND', sourceEntryId: input.sourceEntryId, isDeleted: 0 },
      lock: { mode: 'pessimistic_write' },
    });
    if (existingPosting) return existingPosting;

    const quantity = Number(input.quantity);
    if (quantity <= 0) throw new BadRequestException('采购入库过账数量必须大于0');

    const batchNo = input.batchNo || '';
    const dimensionKey = this.buildDimensionKey(input.warehouseId, input.materialId, batchNo);
    let inventory = await inventoryRepository.findOne({
      where: { dimensionKey, isDeleted: 0 },
      lock: { mode: 'pessimistic_write' },
    });

    // 兼容迁移前已有库存：首次被采购入库命中时，将旧记录收敛到确定性库存维度键。
    if (!inventory) {
      inventory = await inventoryRepository
        .createQueryBuilder('inventory')
        .setLock('pessimistic_write')
        .where('inventory.warehouseId = :warehouseId', { warehouseId: input.warehouseId })
        .andWhere('inventory.materialId = :materialId', { materialId: input.materialId })
        .andWhere("COALESCE(inventory.batch_no, '') = :batchNo", { batchNo })
        .andWhere('inventory.isDeleted = 0')
        .orderBy('inventory.createdAt', 'ASC')
        .getOne();
    }

    const inboundAmount = this.round(Number(input.amount || 0), 2);
    if (!inventory) {
      inventory = inventoryRepository.create({
        dimensionKey,
        warehouseId: input.warehouseId,
        materialId: input.materialId,
        batchNo,
        quantity,
        lockedQty: 0,
        availableQty: quantity,
        unitCost: quantity > 0 ? this.round(inboundAmount / quantity, 6) : 0,
        totalCost: inboundAmount,
        inboundDate: input.inboundDate,
        expiryDate: input.expiryDate,
        status: 1,
      });
    } else {
      const oldQuantity = Number(inventory.quantity || 0);
      const newQuantity = this.round(oldQuantity + quantity, 4);
      const newTotalCost = this.round(Number(inventory.totalCost || 0) + inboundAmount, 2);
      inventory.dimensionKey = dimensionKey;
      inventory.batchNo = batchNo;
      inventory.quantity = newQuantity;
      inventory.availableQty = this.round(newQuantity - Number(inventory.lockedQty || 0), 4);
      inventory.totalCost = newTotalCost;
      inventory.unitCost = newQuantity > 0 ? this.round(newTotalCost / newQuantity, 6) : 0;
      inventory.inboundDate = input.inboundDate;
      if (input.expiryDate) inventory.expiryDate = input.expiryDate;
    }
    inventory = await inventoryRepository.save(inventory);

    const posting = postingRepository.create({
      sourceType: 'PURCHASE_INBOUND',
      sourceId: input.sourceId,
      sourceEntryId: input.sourceEntryId,
      inventoryId: inventory.id,
      warehouseId: input.warehouseId,
      materialId: input.materialId,
      batchNo,
      quantity,
      amount: inboundAmount,
      postedAt: new Date(),
    });
    return postingRepository.save(posting);
  }

  async getStockSummary() {
    const result = await this.inventoryRepository
      .createQueryBuilder('inv')
      .select('COUNT(*)', 'totalRecords')
      .addSelect('SUM(inv.quantity)', 'totalQuantity')
      .addSelect('SUM(inv.locked_qty)', 'totalLocked')
      .addSelect('SUM(inv.available_qty)', 'totalAvailable')
      .addSelect('SUM(inv.total_cost)', 'totalCost')
      .where('inv.is_deleted = 0')
      .getRawOne();
    return result;
  }
}
