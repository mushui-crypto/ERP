import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('hr_recruitment_requirement')
export class RecruitmentRequirement extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'requirement_no', length: 50, comment: '需求编号' })
  requirementNo: string;

  @Column({ name: 'org_id', length: 36, comment: '组织ID' })
  orgId: string;

  @Column({ name: 'department_id', length: 36, comment: '部门ID' })
  departmentId: string;

  @Column({ name: 'department_name', length: 200, comment: '部门名称' })
  departmentName: string;

  @Column({ name: 'position_id', length: 36, comment: '职位ID' })
  positionId: string;

  @Column({ name: 'position_name', length: 200, comment: '职位名称' })
  positionName: string;

  @Column({ type: 'int', comment: '招聘人数' })
  headcount: number;

  @Column({ type: 'int', comment: '已招人数' })
  hiredCount: number;

  @Column({ name: 'requirement_type', type: 'int', comment: '需求类型: 1-新岗位 2-补充流失 3-编制扩张' })
  requirementType: number;

  @Column({ name: 'education', length: 50, comment: '学历要求' })
  education: string;

  @Column({ name: 'work_experience', length: 50, comment: '工作经验要求' })
  workExperience: string;

  @Column({ name: 'salary_min', type: 'decimal', precision: 12, scale: 2, comment: '薪资下限' })
  salaryMin: number;

  @Column({ name: 'salary_max', type: 'decimal', precision: 12, scale: 2, comment: '薪资上限' })
  salaryMax: number;

  @Column({ name: 'job_description', type: 'text', comment: '岗位职责' })
  jobDescription: string;

  @Column({ name: 'requirements', type: 'text', comment: '任职要求' })
  requirements: string;

  @Column({ name: 'recruitment_channel', length: 500, nullable: true, comment: '招聘渠道' })
  recruitmentChannel: string;

  @Column({ name: 'expected_start_date', type: 'datetime', comment: '期望到岗日期' })
  expectedStartDate: Date;

  @Column({ name: 'requester_id', length: 36, comment: '申请人ID' })
  requesterId: string;

  @Column({ name: 'requester_name', length: 50, comment: '申请人姓名' })
  requesterName: string;

  @Column({ type: 'int', default: 0, comment: '状态: 0-草稿 1-待审核 2-已批准 3-招聘中 4-已完成 5-已取消' })
  status: number;

  @Column({ length: 500, nullable: true, comment: '备注' })
  remark: string;
}