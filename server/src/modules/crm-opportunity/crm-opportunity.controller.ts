import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { CrmOpportunityService } from './crm-opportunity.service';
import { CrmOpportunity } from '../../database/entities/crm-opportunity.entity';
import { CrmSalesStage } from '../../database/entities/crm-sales-stage.entity';
import { CrmOpportunityActivity } from '../../database/entities/crm-opportunity-activity.entity';

@Controller('crm-opportunities')
export class CrmOpportunityController {
  constructor(private crmOpportunityService: CrmOpportunityService) {}

  @Get('statistics')
  async getStatistics() {
    return this.crmOpportunityService.getStatistics();
  }

  @Get('funnel')
  async getSalesFunnel() {
    return this.crmOpportunityService.getSalesFunnel();
  }

  @Get('stages')
  async findStages() {
    return this.crmOpportunityService.findStages();
  }

  @Post('stages')
  async createStage(@Body() data: Partial<CrmSalesStage>) {
    return this.crmOpportunityService.createStage(data);
  }

  @Put('stages/:id')
  async updateStage(@Param('id') id: string, @Body() data: Partial<CrmSalesStage>) {
    return this.crmOpportunityService.updateStage(id, data);
  }

  @Delete('stages/:id')
  async deleteStage(@Param('id') id: string) {
    return this.crmOpportunityService.deleteStage(id);
  }

  @Get()
  async findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('stageId') stageId?: string,
    @Query('customerId') customerId?: string,
    @Query('status') status?: number,
  ) {
    return this.crmOpportunityService.findAll(page, pageSize, stageId, customerId, status);
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    return this.crmOpportunityService.findById(id);
  }

  @Post()
  async create(@Body() data: Partial<CrmOpportunity>) {
    return this.crmOpportunityService.create(data);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() data: Partial<CrmOpportunity>) {
    return this.crmOpportunityService.update(id, data);
  }

  @Put(':id/advance')
  async advanceStage(@Param('id') id: string, @Body('nextStageId') nextStageId: string) {
    return this.crmOpportunityService.advanceStage(id, nextStageId);
  }

  @Put(':id/won')
  async won(@Param('id') id: string) {
    return this.crmOpportunityService.won(id);
  }

  @Put(':id/lost')
  async lost(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.crmOpportunityService.lost(id, reason);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.crmOpportunityService.remove(id);
  }

  @Get(':opportunityId/activities')
  async findActivities(
    @Param('opportunityId') opportunityId: string,
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.crmOpportunityService.findActivities(opportunityId, page, pageSize);
  }

  @Post('activities')
  async createActivity(@Body() data: Partial<CrmOpportunityActivity>) {
    return this.crmOpportunityService.createActivity(data);
  }
}