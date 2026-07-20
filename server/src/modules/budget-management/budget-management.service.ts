import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinBudget } from '../../database/entities/fin-budget.entity';
import { FinBudgetItem } from '../../database/entities/fin-budget-item.entity';

@Injectable()
export class BudgetManagementService {
  constructor(
    @InjectRepository(FinBudget)
    private budgetRepository: Repository<FinBudget>,
    @InjectRepository(FinBudgetItem)
    private budgetItemRepository: Repository<FinBudgetItem>,
  ) {}

  async generateBudgetNo(): Promise<string> {
    const now = new Date();
    const prefix = 'BG';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.budgetRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async createBudget(data: Partial<FinBudget>, items: Partial<FinBudgetItem>[]): Promise<FinBudget> {
    const budgetNo = await this.generateBudgetNo();
    
    const totalBudget = items.reduce((sum, item) => sum + Number(item.budgetAmount || 0), 0);

    const budget = this.budgetRepository.create({
      ...data,
      budgetNo,
      budgetAmount: totalBudget,
      actualAmount: 0,
      balance: totalBudget,
      status: 0,
    });

    const savedBudget = await this.budgetRepository.save(budget);

    for (const item of items) {
      await this.budgetItemRepository.save({
        ...item,
        budgetId: savedBudget.id,
        budgetNo: savedBudget.budgetNo,
        actualAmount: 0,
        balance: item.budgetAmount,
        variance: 0,
        varianceRate: 0,
      });
    }

    return savedBudget;
  }

  async submitBudget(id: string): Promise<FinBudget> {
    const budget = await this.budgetRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!budget) throw new NotFoundException('预算不存在');
    if (budget.status !== 0) throw new BadRequestException('只能提交编制中的预算');
    
    budget.status = 1;
    return this.budgetRepository.save(budget);
  }

  async approveBudget(id: string, approvedBy: string): Promise<FinBudget> {
    const budget = await this.budgetRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!budget) throw new NotFoundException('预算不存在');
    if (budget.status !== 1) throw new BadRequestException('只能审批待审核状态的预算');
    
    budget.status = 2;
    budget.approvedBy = approvedBy;
    budget.approvedAt = new Date();
    return this.budgetRepository.save(budget);
  }

  async executeBudget(id: string): Promise<FinBudget> {
    const budget = await this.budgetRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!budget) throw new NotFoundException('预算不存在');
    if (budget.status !== 2) throw new BadRequestException('只能执行已批准的预算');
    
    budget.status = 3;
    return this.budgetRepository.save(budget);
  }

  async updateBudget(id: string, data: Partial<FinBudget>): Promise<FinBudget> {
    const budget = await this.budgetRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!budget) throw new NotFoundException('预算不存在');
    if (budget.status >= 2) throw new BadRequestException('已批准的预算不允许修改');
    
    Object.assign(budget, data);
    return this.budgetRepository.save(budget);
  }

  async deleteBudget(id: string): Promise<void> {
    const budget = await this.budgetRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!budget) throw new NotFoundException('预算不存在');
    if (budget.status >= 3) throw new BadRequestException('执行中的预算不允许删除');
    
    budget.isDeleted = 1;
    await this.budgetRepository.save(budget);
    await this.budgetItemRepository.update({ budgetId: id }, { isDeleted: 1 });
  }

  async findBudgets(page = 1, pageSize = 20, budgetType?: string, status?: number): Promise<any> {
    const query = this.budgetRepository.createQueryBuilder('b')
      .where('b.isDeleted = 0');

    if (budgetType) {
      query.andWhere('b.budgetType = :budgetType', { budgetType });
    }
    if (status !== undefined && status !== null) {
      query.andWhere('b.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('b.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findBudgetById(id: string): Promise<any> {
    const budget = await this.budgetRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!budget) return null;

    const items = await this.budgetItemRepository.find({ where: { budgetId: id, isDeleted: 0 } });

    return {
      ...budget,
      items,
    };
  }

  async findBudgetItems(budgetId: string): Promise<FinBudgetItem[]> {
    return this.budgetItemRepository.find({ where: { budgetId, isDeleted: 0 } });
  }

  async updateActualAmount(budgetId: string, itemCode: string, actualAmount: number): Promise<FinBudgetItem> {
    const item = await this.budgetItemRepository.findOne({ where: { budgetId, itemCode, isDeleted: 0 } });
    if (!item) throw new NotFoundException('预算项目不存在');

    item.actualAmount = actualAmount;
    item.balance = Number(item.budgetAmount) - actualAmount;
    item.variance = actualAmount - Number(item.budgetAmount);
    item.varianceRate = Number(item.budgetAmount) > 0 ? (item.variance / Number(item.budgetAmount)) * 100 : 0;

    await this.budgetItemRepository.save(item);

    await this.updateBudgetActualAmount(budgetId);

    return item;
  }

  async updateBudgetActualAmount(budgetId: string): Promise<void> {
    const items = await this.budgetItemRepository.find({ where: { budgetId, isDeleted: 0 } });
    const totalActual = items.reduce((sum, item) => sum + Number(item.actualAmount || 0), 0);

    const budget = await this.budgetRepository.findOne({ where: { id: budgetId, isDeleted: 0 } });
    if (budget) {
      budget.actualAmount = totalActual;
      budget.balance = Number(budget.budgetAmount) - totalActual;
      await this.budgetRepository.save(budget);
    }
  }

  async getBudgetStatistics(): Promise<any> {
    const totalBudget = await this.budgetRepository.count({ where: { isDeleted: 0 } });
    const approvedBudget = await this.budgetRepository.count({ where: { isDeleted: 0, status: 2 } });
    const executingBudget = await this.budgetRepository.count({ where: { isDeleted: 0, status: 3 } });
    const completedBudget = await this.budgetRepository.count({ where: { isDeleted: 0, status: 4 } });

    const budgetAmountStats = await this.budgetRepository.createQueryBuilder('b')
      .select('SUM(b.budgetAmount)', 'totalBudget')
      .addSelect('SUM(b.actualAmount)', 'totalActual')
      .where('b.isDeleted = 0')
      .getRawOne();

    const typeStats = await this.budgetRepository.createQueryBuilder('b')
      .select('b.budgetType', 'type')
      .addSelect('SUM(b.budgetAmount)', 'budgetAmount')
      .addSelect('SUM(b.actualAmount)', 'actualAmount')
      .where('b.isDeleted = 0')
      .groupBy('b.budgetType')
      .getRawMany();

    return {
      totalBudget,
      approvedBudget,
      executingBudget,
      completedBudget,
      budgetAmountStats: {
        totalBudget: Number(budgetAmountStats.totalBudget) || 0,
        totalActual: Number(budgetAmountStats.totalActual) || 0,
      },
      typeStats: typeStats.map(s => ({
        type: s.type,
        budgetAmount: Number(s.budgetAmount) || 0,
        actualAmount: Number(s.actualAmount) || 0,
      })),
    };
  }
}