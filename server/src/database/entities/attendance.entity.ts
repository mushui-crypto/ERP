import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('hr_attendance')
export class Attendance extends BaseEntity {
  @Index()
  @Column({ name: 'emp_id', length: 36, comment: '员工ID' })
  empId: string;

  @Column({ name: 'attend_date', type: 'datetime', comment: '考勤日期' })
  attendDate: Date;

  @Column({ name: 'clock_in', type: 'datetime', nullable: true, comment: '上班打卡时间' })
  clockIn: Date;

  @Column({ name: 'clock_out', type: 'datetime', nullable: true, comment: '下班打卡时间' })
  clockOut: Date;

  @Column({ type: 'int', default: 0, comment: '状态: 0-未打卡 1-正常 2-迟到 3-早退 4-缺勤 5-请假' })
  status: number;

  @Column({ name: 'work_hours', type: 'decimal', precision: 5, scale: 2, default: 0, comment: '工作时长' })
  workHours: number;

  @Column({ name: 'overtime_hours', type: 'decimal', precision: 5, scale: 2, default: 0, comment: '加班时长' })
  overtimeHours: number;

  @Column({ type: 'text', nullable: true, comment: '备注' })
  remark: string;
}
