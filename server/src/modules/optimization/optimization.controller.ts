import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { OptimizationService } from './optimization.service';

@Controller('optimization')
export class OptimizationController {
  constructor(private optimizationService: OptimizationService) {}

  @Get('statistics')
  async getStatistics() {
    return this.optimizationService.getStatistics();
  }

  @Post('analyze/all')
  async analyzeAll() {
    return this.optimizationService.analyzeAll();
  }

  @Post('analyze/production')
  async analyzeProductionScheduling() {
    return this.optimizationService.analyzeProductionScheduling();
  }

  @Post('analyze/warehouse')
  async analyzeWarehouseManagement() {
    return this.optimizationService.analyzeWarehouseManagement();
  }

  @Post('analyze/process')
  async analyzeProcessOptimization() {
    return this.optimizationService.analyzeProcessOptimization();
  }

  @Post('analyze/hr')
  async analyzeHrAllocation() {
    return this.optimizationService.analyzeHrAllocation();
  }

  @Get()
  async findSuggestions(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('optimizationType') optimizationType?: string,
    @Query('priority') priority?: string,
    @Query('status') status?: string,
  ) {
    const prio = priority !== undefined ? Number(priority) : undefined;
    const stat = status !== undefined ? Number(status) : undefined;
    return this.optimizationService.findSuggestions(page, pageSize, optimizationType, prio, stat);
  }

  @Get(':id')
  async findSuggestionById(@Param('id') id: string) {
    return this.optimizationService.findSuggestionById(id);
  }

  @Put(':id/accept')
  async acceptSuggestion(@Param('id') id: string, @Body() body: { assessedBy: string; remark?: string }) {
    return this.optimizationService.acceptSuggestion(id, body.assessedBy, body.remark);
  }

  @Put(':id/implement')
  async implementSuggestion(@Param('id') id: string, @Body() body: { assessedBy: string; remark?: string }) {
    return this.optimizationService.implementSuggestion(id, body.assessedBy, body.remark);
  }

  @Put(':id/reject')
  async rejectSuggestion(@Param('id') id: string, @Body() body: { assessedBy: string; remark?: string }) {
    return this.optimizationService.rejectSuggestion(id, body.assessedBy, body.remark);
  }

  @Delete(':id')
  async deleteSuggestion(@Param('id') id: string) {
    return this.optimizationService.deleteSuggestion(id);
  }
}