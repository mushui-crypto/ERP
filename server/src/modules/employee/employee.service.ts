import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Employee } from '../../database/entities/employee.entity';
import { CreateEmployeeDto, UpdateEmployeeDto, EmployeeLeaveDto } from './dto/employee.dto';

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private employeeRepository: Repository<Employee>,
  ) {}

  async findAll(page = 1, pageSize = 20, deptId?: string, status?: number) {
    const query = this.employeeRepository.createQueryBuilder('e')
      .where('e.isDeleted = 0');
    
    if (deptId) {
      query.andWhere('e.deptId = :deptId', { deptId });
    }
    if (status !== undefined) {
      query.andWhere('e.status = :status', { status });
    }
    
    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('e.createdAt', 'DESC')
      .getManyAndCount();
    
    return { list, total, page, pageSize };
  }

  async findById(id: string): Promise<Employee | null> {
    return this.employeeRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findByDeptId(deptId: string): Promise<Employee[]> {
    return this.employeeRepository.find({ where: { deptId, isDeleted: 0 } });
  }

  async findByEmpCode(empCode: string): Promise<Employee | null> {
    return this.employeeRepository.findOne({ where: { empCode, isDeleted: 0 } });
  }

  async generateEmpCode(): Promise<string> {
    const now = new Date();
    const prefix = 'EMP';
    const year = now.getFullYear().toString().slice(-2);
    const count = await this.employeeRepository.count({
      where: { isDeleted: 0 },
    });
    return `${prefix}${year}${String(count + 1).padStart(4, '0')}`;
  }

  async create(dto: CreateEmployeeDto): Promise<Employee> {
    const existing = await this.findByEmpCode(dto.empCode);
    if (existing) {
      throw new ConflictException('员工编码已存在');
    }
    
    const employee = this.employeeRepository.create({
      ...dto,
      status: 1,
    });
    return this.employeeRepository.save(employee);
  }

  async update(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const employee = await this.findById(id);
    if (!employee) throw new NotFoundException('员工不存在');
    
    if (dto.empCode && dto.empCode !== employee.empCode) {
      const existing = await this.findByEmpCode(dto.empCode);
      if (existing) {
        throw new ConflictException('员工编码已存在');
      }
    }
    
    Object.assign(employee, dto);
    return this.employeeRepository.save(employee);
  }

  async remove(id: string): Promise<void> {
    const employee = await this.findById(id);
    if (!employee) throw new NotFoundException('员工不存在');
    
    if (employee.status === 1) {
      throw new BadRequestException('在职员工不允许删除，请先办理离职');
    }
    
    employee.isDeleted = 1;
    await this.employeeRepository.save(employee);
  }

  async leave(id: string, dto: EmployeeLeaveDto): Promise<Employee> {
    const employee = await this.findById(id);
    if (!employee) throw new NotFoundException('员工不存在');
    
    if (employee.status === 0) {
      throw new BadRequestException('员工已离职');
    }
    
    employee.status = 0;
    employee.leaveDate = new Date(dto.leaveDate);
    if (dto.remark) {
      employee.remark = dto.remark;
    }
    
    return this.employeeRepository.save(employee);
  }

  async getStatusSummary(): Promise<any> {
    const [list, total] = await this.employeeRepository.findAndCount({
      where: { isDeleted: 0 },
    });
    
    const activeCount = list.filter(e => e.status === 1).length;
    const inactiveCount = list.filter(e => e.status === 0).length;
    
    return {
      total,
      activeCount,
      inactiveCount,
    };
  }
}