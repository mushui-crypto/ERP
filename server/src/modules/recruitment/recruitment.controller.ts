import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { RecruitmentService } from './recruitment.service';
import { RecruitmentRequirement } from '../../database/entities/recruitment-requirement.entity';
import { RecruitmentCandidate } from '../../database/entities/recruitment-candidate.entity';
import { RecruitmentInterview } from '../../database/entities/recruitment-interview.entity';

@Controller('recruitment')
export class RecruitmentController {
  constructor(private recruitmentService: RecruitmentService) {}

  @Get('statistics')
  async getStatistics() {
    return this.recruitmentService.getStatistics();
  }

  @Get('requirements')
  async findRequirements(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('status') status?: number,
  ) {
    return this.recruitmentService.findRequirements(page, pageSize, status);
  }

  @Get('requirements/:id')
  async findRequirementById(@Param('id') id: string) {
    return this.recruitmentService.findRequirementById(id);
  }

  @Post('requirements')
  async createRequirement(@Body() data: Partial<RecruitmentRequirement>) {
    return this.recruitmentService.createRequirement(data);
  }

  @Put('requirements/:id')
  async updateRequirement(@Param('id') id: string, @Body() data: Partial<RecruitmentRequirement>) {
    return this.recruitmentService.updateRequirement(id, data);
  }

  @Put('requirements/:id/submit')
  async submitRequirement(@Param('id') id: string) {
    return this.recruitmentService.submitRequirement(id);
  }

  @Put('requirements/:id/approve')
  async approveRequirement(@Param('id') id: string) {
    return this.recruitmentService.approveRequirement(id);
  }

  @Put('requirements/:id/start')
  async startRecruitment(@Param('id') id: string) {
    return this.recruitmentService.startRecruitment(id);
  }

  @Put('requirements/:id/complete')
  async completeRequirement(@Param('id') id: string) {
    return this.recruitmentService.completeRequirement(id);
  }

  @Put('requirements/:id/cancel')
  async cancelRequirement(@Param('id') id: string) {
    return this.recruitmentService.cancelRequirement(id);
  }

  @Delete('requirements/:id')
  async deleteRequirement(@Param('id') id: string) {
    return this.recruitmentService.deleteRequirement(id);
  }

  @Get('candidates')
  async findCandidates(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('requirementId') requirementId?: string,
    @Query('status') status?: number,
  ) {
    return this.recruitmentService.findCandidates(page, pageSize, requirementId, status);
  }

  @Post('candidates')
  async createCandidate(@Body() data: Partial<RecruitmentCandidate>) {
    return this.recruitmentService.createCandidate(data);
  }

  @Put('candidates/:id')
  async updateCandidate(@Param('id') id: string, @Body() data: Partial<RecruitmentCandidate>) {
    return this.recruitmentService.updateCandidate(id, data);
  }

  @Put('candidates/:id/screen')
  async screenCandidate(@Param('id') id: string, @Body('result') result: number) {
    return this.recruitmentService.screenCandidate(id, result);
  }

  @Put('candidates/:id/hire')
  async hireCandidate(@Param('id') id: string) {
    return this.recruitmentService.hireCandidate(id);
  }

  @Put('candidates/:id/reject')
  async rejectCandidate(@Param('id') id: string) {
    return this.recruitmentService.rejectCandidate(id);
  }

  @Put('candidates/:id/onboard')
  async confirmOnboard(@Param('id') id: string) {
    return this.recruitmentService.confirmOnboard(id);
  }

  @Get('interviews')
  async findInterviews(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('candidateId') candidateId?: string,
  ) {
    return this.recruitmentService.findInterviews(page, pageSize, candidateId);
  }

  @Post('interviews')
  async createInterview(@Body() data: Partial<RecruitmentInterview>) {
    return this.recruitmentService.createInterview(data);
  }

  @Put('interviews/:id/complete')
  async completeInterview(
    @Param('id') id: string,
    @Body('result') result: number,
    @Body('score') score?: number,
    @Body('comment') comment?: string,
  ) {
    return this.recruitmentService.completeInterview(id, result, score, comment);
  }
}