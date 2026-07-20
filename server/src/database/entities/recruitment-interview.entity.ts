import { Entity, Column, Index } from 'typeorm';
import { BaseEntity } from './base.entity';

@Entity('hr_recruitment_interview')
export class RecruitmentInterview extends BaseEntity {
  @Index({ unique: true })
  @Column({ name: 'interview_no', length: 50, comment: '面试编号' })
  interviewNo: string;

  @Column({ name: 'candidate_id', length: 36, comment: '候选人ID' })
  candidateId: string;

  @Column({ name: 'candidate_name', length: 50, comment: '候选人姓名' })
  candidateName: string;

  @Column({ name: 'position_name', length: 200, comment: '应聘职位' })
  positionName: string;

  @Column({ name: 'interview_round', type: 'int', comment: '面试轮次: 1-初试 2-复试 3-终试' })
  interviewRound: number;

  @Column({ name: 'interview_date', type: 'datetime', comment: '面试日期' })
  interviewDate: Date;

  @Column({ name: 'interviewer_id', length: 36, comment: '面试官ID' })
  interviewerId: string;

  @Column({ name: 'interviewer_name', length: 50, comment: '面试官姓名' })
  interviewerName: string;

  @Column({ name: 'interview_result', type: 'int', comment: '面试结果: 1-通过 2-待定 3-不通过' })
  interviewResult: number;

  @Column({ name: 'evaluation_score', type: 'decimal', precision: 5, scale: 2, nullable: true, comment: '评分' })
  evaluationScore: number;

  @Column({ name: 'evaluation_comment', type: 'text', nullable: true, comment: '评价意见' })
  evaluationComment: string;

  @Column({ name: 'next_interview_date', type: 'datetime', nullable: true, comment: '下一轮面试日期' })
  nextInterviewDate: Date;

  @Column({ type: 'int', default: 0, comment: '状态: 0-待面试 1-已完成' })
  status: number;
}