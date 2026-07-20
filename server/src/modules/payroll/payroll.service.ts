import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payroll } from '../../database/entities/payroll.entity';
import { CreatePayrollDto, UpdatePayrollDto, CalculatePayrollDto } from './dto/payroll.dto';

@Injectable()
export class PayrollService {
  constructor(
    @InjectRepository(Payroll)
    private payrollRepository: Repository<Payroll>,
  ) {}

  async findAll(page = 1, pageSize = 20, empId?: string, period?: string) {
    const query = this.payrollRepository.createQueryBuilder('p')
      .where('p.isDeleted = 0');
    
    if (empId) {
      query.andWhere('p.empId = :empId', { empId });
    }
    if (period) {
      query.andWhere('p.period = :period', { period });
    }
    
    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('p.createdAt', 'DESC')
      .getManyAndCount();
    
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Payroll | null> {
    return this.payrollRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByEmpId(empId: string): Promise<Payroll[]> {
    return this.payrollRepository.find({ where: { empId, isDeleted: 0 }, order: { period: 'DESC' } });
  }

  async findByPeriod(period: string): Promise<Payroll[]> {
    return this.payrollRepository.find({ where: { period, isDeleted: 0 } });
  }

  calculateTax(income: number): number {
    const threshold = 5000;
    const taxableIncome = income - threshold;
    
    if (taxableIncome <= 0) return 0;
    if (taxableIncome <= 3000) return taxableIncome * 0.03;
    if (taxableIncome <= 12000) return taxableIncome * 0.10 - 210;
    if (taxableIncome <= 25000) return taxableIncome * 0.20 - 1410;
    if (taxableIncome <= 35000) return taxableIncome * 0.25 - 2660;
    if (taxableIncome <= 55000) return taxableIncome * 0.30 - 4410;
    if (taxableIncome <= 80000) return taxableIncome * 0.35 - 7160;
    return taxableIncome * 0.45 - 15160;
  }

  calculateNetPay(payroll: Payroll): number {
    const grossPay = Number(payroll.basicSalary) + Number(payroll.overtimePay) + Number(payroll.bonus);
    const deductions = Number(payroll.deduction) + Number(payroll.socialInsurance);
    const taxableIncome = grossPay - deductions;
    const tax = this.calculateTax(taxableIncome);
    return Math.round((grossPay - deductions - tax) * 100) / 100;
  }

  async calculatePayroll(dto: CalculatePayrollDto): Promise<Payroll> {
    const existing = await this.payrollRepository.findOne({
      where: { empId: dto.empId, period: dto.period, isDeleted: 0 },
    });
    
    if (existing) {
      throw new ConflictException(`该员工${dto.period}期薪酬已计算`);
    }
    
    const payroll = this.payrollRepository.create({
      empId: dto.empId,
      period: dto.period,
      basicSalary: 0,
      overtimePay: 0,
      bonus: 0,
      deduction: 0,
      socialInsurance: 0,
      tax: 0,
      netPay: 0,
      status: 0,
    });
    
    return this.payrollRepository.save(payroll);
  }

  async create(dto: CreatePayrollDto): Promise<Payroll> {
    const existing = await this.payrollRepository.findOne({
      where: { empId: dto.empId, period: dto.period, isDeleted: 0 },
    });
    
    if (existing) {
      throw new ConflictException(`该员工${dto.period}期薪酬已存在`);
    }
    
    const payroll = this.payrollRepository.create({
      ...dto,
      overtimePay: dto.overtimePay || 0,
      bonus: dto.bonus || 0,
      deduction: dto.deduction || 0,
      socialInsurance: dto.socialInsurance || 0,
      tax: dto.tax || 0,
      netPay: 0,
      status: 0,
    });
    
    payroll.netPay = this.calculateNetPay(payroll);
    
    return this.payrollRepository.save(payroll);
  }

  async update(id: string, dto: UpdatePayrollDto): Promise<Payroll> {
    const payroll = await this.findById(id);
    if (!payroll) throw new NotFoundException('薪酬记录不存在');
    
    if (payroll.status >= 1) {
      throw new BadRequestException('已审核的薪酬不允许修改');
    }
    
    Object.assign(payroll, dto);
    payroll.netPay = this.calculateNetPay(payroll);
    
    return this.payrollRepository.save(payroll);
  }

  async remove(id: string): Promise<void> {
    const payroll = await this.findById(id);
    if (!payroll) throw new NotFoundException('薪酬记录不存在');
    
    if (payroll.status >= 1) {
      throw new BadRequestException('已审核的薪酬不允许删除');
    }
    
    payroll.isDeleted = 1;
    await this.payrollRepository.save(payroll);
  }

  async approve(id: string): Promise<Payroll> {
    const payroll = await this.findById(id);
    if (!payroll) throw new NotFoundException('薪酬记录不存在');
    
    if (payroll.status !== 0) {
      throw new BadRequestException('只能审核草稿状态的薪酬');
    }
    
    payroll.status = 1;
    return this.payrollRepository.save(payroll);
  }

  async pay(id: string): Promise<Payroll> {
    const payroll = await this.findById(id);
    if (!payroll) throw new NotFoundException('薪酬记录不存在');
    
    if (payroll.status !== 1) {
      throw new BadRequestException('只能发放已审核的薪酬');
    }
    
    payroll.status = 2;
    return this.payrollRepository.save(payroll);
  }

  async batchApprove(ids: string[]): Promise<Payroll[]> {
    const result: Payroll[] = [];
    for (const id of ids) {
      const payroll = await this.findById(id);
      if (payroll && payroll.status === 0) {
        payroll.status = 1;
        result.push(await this.payrollRepository.save(payroll));
      }
    }
    return result;
  }

  async getPeriodSummary(period: string): Promise<any> {
    const query = this.payrollRepository.createQueryBuilder('p')
      .select([
        'COUNT(*) as totalEmployees',
        'SUM(p.basicSalary) as totalBasicSalary',
        'SUM(p.overtimePay) as totalOvertimePay',
        'SUM(p.bonus) as totalBonus',
        'SUM(p.deduction) as totalDeduction',
        'SUM(p.socialInsurance) as totalSocialInsurance',
        'SUM(p.tax) as totalTax',
        'SUM(p.netPay) as totalNetPay',
      ])
      .where('p.isDeleted = 0 AND p.period = :period', { period });
    
    const result = await query.getRawOne();
    
    return {
      period,
      totalEmployees: result.totalEmployees || 0,
      totalBasicSalary: result.totalBasicSalary || 0,
      totalOvertimePay: result.totalOvertimePay || 0,
      totalBonus: result.totalBonus || 0,
      totalDeduction: result.totalDeduction || 0,
      totalSocialInsurance: result.totalSocialInsurance || 0,
      totalTax: result.totalTax || 0,
      totalNetPay: result.totalNetPay || 0,
    };
  }
}