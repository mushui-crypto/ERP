import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('master_employee')
export class Employee extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'emp_code', length: 50, comment: '员工编码' })
  empCode: string;

  @Column({ name: 'emp_name', length: 50, comment: '员工姓名' })
  empName: string;

  @Column({ type: 'int', default: 0, comment: '性别: 0-未知 1-男 2-女' })
  gender: number;

  @Column({ name: 'birth_date', type: 'datetime', nullable: true, comment: '出生日期' })
  birthDate: Date;

  @Column({ name: 'id_card', length: 18, nullable: true, comment: '身份证号' })
  idCard: string;

  @Column({ length: 20, nullable: true, comment: '电话' })
  phone: string;

  @Column({ length: 100, nullable: true, comment: '邮箱' })
  email: string;

  @Column({ name: 'dept_id', length: 36, nullable: true, comment: '部门ID' })
  deptId: string;

  @Column({ name: 'position_id', length: 36, nullable: true, comment: '岗位ID' })
  positionId: string;

  @Column({ name: 'hire_date', type: 'datetime', nullable: true, comment: '入职日期' })
  hireDate: Date;

  @Column({ name: 'leave_date', type: 'datetime', nullable: true, comment: '离职日期' })
  leaveDate: Date;

  @Column({ type: 'int', default: 1, comment: '状态: 1-在职 0-离职' })
  status: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
