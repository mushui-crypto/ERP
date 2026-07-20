import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecruitmentController } from './recruitment.controller';
import { RecruitmentService } from './recruitment.service';
import { RecruitmentRequirement } from '../../database/entities/recruitment-requirement.entity';
import { RecruitmentCandidate } from '../../database/entities/recruitment-candidate.entity';
import { RecruitmentInterview } from '../../database/entities/recruitment-interview.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RecruitmentRequirement, RecruitmentCandidate, RecruitmentInterview])],
  controllers: [RecruitmentController],
  providers: [RecruitmentService],
})
export class RecruitmentModule {}