import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('hr_payroll')
export class Payroll extends BaseEntity {
  @Index()
  @Column({ name: 'emp_id', length: 36, comment: '员工ID' })
  empId: string;

  @Column({ length: 20, comment: '薪酬周期，如2026-07' })
  period: string;

  @Column({ name: 'basic_salary', type: 'decimal', precision: 18, scale: 2, comment: '基本工资' })
  basicSalary: number;

  @Column({ name: 'overtime_pay', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '加班费' })
  overtimePay: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, comment: '奖金' })
  bonus: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, comment: '扣款' })
  deduction: number;

  @Column({ name: 'social_insurance', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '社保' })
  socialInsurance: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0, comment: '个税' })
  tax: number;

  @Column({ name: 'net_pay', type: 'decimal', precision: 18, scale: 2, default: 0, comment: '实发工资' })
  netPay: number;

  @Column({ type: 'int', default: 0, comment: '状态: 0-草稿 1-已审核 2-已发放' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
