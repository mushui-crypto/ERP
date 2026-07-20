import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { TrainingService } from './training.service';
import { TrainingPlan } from '../../database/entities/training-plan.entity';

@Controller('training')
export class TrainingController {
  constructor(private trainingService: TrainingService) {}

  @Get('statistics')
  async getStatistics() {
    return this.trainingService.getStatistics();
  }

  @Get('plans')
  async findPlans(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('status') status?: number,
  ) {
    return this.trainingService.findPlans(page, pageSize, status);
  }

  @Get('plans/:id')
  async findPlanById(@Param('id') id: string) {
    return this.trainingService.findPlanById(id);
  }

  @Post('plans')
  async createPlan(@Body() data: Partial<TrainingPlan>) {
    return this.trainingService.createPlan(data);
  }

  @Put('plans/:id')
  async updatePlan(@Param('id') id: string, @Body() data: Partial<TrainingPlan>) {
    return this.trainingService.updatePlan(id, data);
  }

  @Put('plans/:id/submit')
  async submitPlan(@Param('id') id: string) {
    return this.trainingService.submitPlan(id);
  }

  @Put('plans/:id/approve')
  async approvePlan(@Param('id') id: string) {
    return this.trainingService.approvePlan(id);
  }

  @Put('plans/:id/start')
  async startPlan(@Param('id') id: string) {
    return this.trainingService.startPlan(id);
  }

  @Put('plans/:id/complete')
  async completePlan(@Param('id') id: string) {
    return this.trainingService.completePlan(id);
  }

  @Put('plans/:id/cancel')
  async cancelPlan(@Param('id') id: string) {
    return this.trainingService.cancelPlan(id);
  }

  @Delete('plans/:id')
  async deletePlan(@Param('id') id: string) {
    return this.trainingService.deletePlan(id);
  }

  @Get('records')
  async findRecords(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('planId') planId?: string,
    @Query('empId') empId?: string,
  ) {
    return this.trainingService.findRecords(page, pageSize, planId, empId);
  }

  @Post('records/enroll')
  async enrollEmployee(
    @Body('planId') planId: string,
    @Body('empId') empId: string,
    @Body('empName') empName: string,
    @Body('departmentId') departmentId: string,
    @Body('departmentName') departmentName: string,
  ) {
    return this.trainingService.enrollEmployee(planId, empId, empName, departmentId, departmentName);
  }

  @Post('records/batch-enroll')
  async batchEnroll(
    @Body('planId') planId: string,
    @Body('employees') employees: { empId: string; empName: string; departmentId: string; departmentName: string }[],
  ) {
    return this.trainingService.batchEnroll(planId, employees);
  }

  @Put('records/:id/attendance')
  async updateAttendance(@Param('id') id: string, @Body('attendanceStatus') attendanceStatus: number) {
    return this.trainingService.updateAttendance(id, attendanceStatus);
  }

  @Put('records/:id/score')
  async updateTestScore(
    @Param('id') id: string,
    @Body('score') score: number,
    @Body('feedback') feedback?: string,
  ) {
    return this.trainingService.updateTestScore(id, score, feedback);
  }
}