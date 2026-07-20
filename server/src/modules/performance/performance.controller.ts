import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { PerformanceService } from './performance.service';
import { PerformancePlan } from '../../database/entities/performance-plan.entity';

@Controller('performance')
export class PerformanceController {
  constructor(private performanceService: PerformanceService) {}

  @Get('statistics')
  async getStatistics(@Query('planId') planId?: string) {
    return this.performanceService.getStatistics(planId);
  }

  @Get('plans')
  async findPlans(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('status') status?: number,
  ) {
    return this.performanceService.findPlans(page, pageSize, status);
  }

  @Get('plans/:id')
  async findPlanById(@Param('id') id: string) {
    return this.performanceService.findPlanById(id);
  }

  @Post('plans')
  async createPlan(@Body() data: Partial<PerformancePlan>) {
    return this.performanceService.createPlan(data);
  }

  @Put('plans/:id')
  async updatePlan(@Param('id') id: string, @Body() data: Partial<PerformancePlan>) {
    return this.performanceService.updatePlan(id, data);
  }

  @Put('plans/:id/publish')
  async publishPlan(@Param('id') id: string) {
    return this.performanceService.publishPlan(id);
  }

  @Put('plans/:id/start-self-assessment')
  async startSelfAssessment(@Param('id') id: string) {
    return this.performanceService.startSelfAssessment(id);
  }

  @Put('plans/:id/start-assessment')
  async startAssessment(@Param('id') id: string) {
    return this.performanceService.startAssessment(id);
  }

  @Put('plans/:id/start-review')
  async startReview(@Param('id') id: string) {
    return this.performanceService.startReview(id);
  }

  @Put('plans/:id/complete')
  async completePlan(@Param('id') id: string) {
    return this.performanceService.completePlan(id);
  }

  @Delete('plans/:id')
  async deletePlan(@Param('id') id: string) {
    return this.performanceService.deletePlan(id);
  }

  @Get('results')
  async findResults(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('planId') planId?: string,
    @Query('empId') empId?: string,
    @Query('status') status?: number,
  ) {
    return this.performanceService.findResults(page, pageSize, planId, empId, status);
  }

  @Post('results')
  async createResult(
    @Body('planId') planId: string,
    @Body('empId') empId: string,
    @Body('empName') empName: string,
    @Body('departmentId') departmentId: string,
    @Body('departmentName') departmentName: string,
    @Body('positionId') positionId: string,
    @Body('positionName') positionName: string,
  ) {
    return this.performanceService.createResult(planId, empId, empName, departmentId, departmentName, positionId, positionName);
  }

  @Post('results/batch')
  async batchCreateResults(
    @Body('planId') planId: string,
    @Body('employees') employees: { empId: string; empName: string; departmentId: string; departmentName: string; positionId: string; positionName: string }[],
  ) {
    return this.performanceService.batchCreateResults(planId, employees);
  }

  @Put('results/:id/self-assessment')
  async submitSelfAssessment(
    @Param('id') id: string,
    @Body('score') score: number,
    @Body('comment') comment?: string,
  ) {
    return this.performanceService.submitSelfAssessment(id, score, comment);
  }

  @Put('results/:id/supervisor-assessment')
  async submitSupervisorAssessment(
    @Param('id') id: string,
    @Body('score') score: number,
    @Body('comment') comment?: string,
  ) {
    return this.performanceService.submitSupervisorAssessment(id, score, comment);
  }

  @Put('results/:id/review')
  async submitReview(
    @Param('id') id: string,
    @Body('finalScore') finalScore?: number,
    @Body('improvementSuggestion') improvementSuggestion?: string,
  ) {
    return this.performanceService.submitReview(id, finalScore, improvementSuggestion);
  }
}