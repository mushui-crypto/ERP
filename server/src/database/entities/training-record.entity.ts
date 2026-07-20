import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('hr_training_record')
export class TrainingRecord extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'record_no', length: 50, comment: '培训记录编号' })
  recordNo: string;

  @Column({ name: 'plan_id', length: 36, comment: '关联计划ID' })
  planId: string;

  @Column({ name: 'plan_no', length: 50, comment: '关联计划编号' })
  planNo: string;

  @Column({ name: 'plan_title', length: 200, comment: '培训主题' })
  planTitle: string;

  @Column({ name: 'emp_id', length: 36, comment: '员工ID' })
  empId: string;

  @Column({ name: 'emp_name', length: 50, comment: '员工姓名' })
  empName: string;

  @Column({ name: 'department_id', length: 36, comment: '部门ID' })
  departmentId: string;

  @Column({ name: 'department_name', length: 200, comment: '部门名称' })
  departmentName: string;

  @Column({ name: 'attendance_status', type: 'int', comment: '出勤状态: 1-出勤 2-缺勤 3-请假' })
  attendanceStatus: number;

  @Column({ name: 'test_score', type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '考试成绩' })
  testScore: number;

  @Column({ type: 'text', nullable: true, comment: '培训心得' })
  feedback: string;

  @Column({ type: 'int', default: 0, comment: '状态: 0-报名中 1-已参加 2-已完成' })
  status: number;
}