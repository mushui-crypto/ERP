import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('sys_user')
export class User extends BaseEntity {
  @Index({ unique: true })
  @Column({ length: 50, comment: '用户名' })
  username: string;

  @Column({ length: 200, select: false, comment: '密码' })
  password: string;

  @Column({ name: 'real_name', length: 50, comment: '真实姓名' })
  realName: string;

  @Column({ length: 100, nullable: true, comment: '邮箱' })
  email: string;

  @Column({ length: 20, nullable: true, comment: '手机号' })
  phone: string;

  

  @Column({ name: 'dept_id', length: 36, nullable: true, comment: '所属部门ID' })
  deptId: string;

  @Column({ name: 'emp_id', length: 36, nullable: true, comment: '关联员工ID' })
  empId: string;

  @Column({ length: 255, nullable: true, comment: '头像URL' })
  avatar: string;

  @Column({ type: 'int', default: 1, comment: '状态: 1-启用 0-禁用' })
  status: number;

  @Column({ name: 'last_login_at', type: 'datetime', nullable: true, comment: '最后登录时间' })
  lastLoginAt: Date;

  @Column({ name: 'last_login_ip', length: 50, nullable: true, comment: '最后登录IP' })
  lastLoginIp: string;
}
