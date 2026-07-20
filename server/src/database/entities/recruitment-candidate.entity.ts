import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('hr_recruitment_candidate')
export class RecruitmentCandidate extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'candidate_no', length: 50, comment: '候选人编号' })
  candidateNo: string;

  @Column({ name: 'requirement_id', length: 36, comment: '关联需求ID' })
  requirementId: string;

  @Column({ name: 'requirement_no', length: 50, comment: '关联需求编号' })
  requirementNo: string;

  @Column({ name: 'position_name', length: 200, comment: '应聘职位' })
  positionName: string;

  @Column({ name: 'name', length: 50, comment: '姓名' })
  name: string;

  @Column({ name: 'gender', type: 'int', comment: '性别: 1-男 2-女' })
  gender: number;

  @Column({ name: 'age', type: 'int', comment: '年龄' })
  age: number;

  @Column({ name: 'education', length: 50, comment: '学历' })
  education: string;

  @Column({ name: 'work_experience', length: 50, comment: '工作经验' })
  workExperience: string;

  @Column({ name: 'phone', length: 20, comment: '手机号码' })
  phone: string;

  @Column({ name: 'email', length: 100, nullable: true, comment: '邮箱' })
  email: string;

  @Column({ name: 'resume_url', length: 500, nullable: true, comment: '简历地址' })
  resumeUrl: string;

  @Column({ name: 'source_channel', length: 100, comment: '来源渠道' })
  sourceChannel: string;

  @Column({ name: 'current_salary', type: 'decimal', precision: 12, scale: 2, nullable: true, comment: '当前薪资' })
  currentSalary: number;

  @Column({ name: 'expected_salary', type: 'decimal', precision: 12, scale: 2, nullable: true, comment: '期望薪资' })
  expectedSalary: number;

  @Column({ type: 'int', default: 0, comment: '状态: 0-待筛选 1-筛选通过 2-面试中 3-已录用 4-已拒绝 5-已入职' })
  status: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}