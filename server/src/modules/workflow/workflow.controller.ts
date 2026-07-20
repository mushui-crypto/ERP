import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { WorkflowService } from './workflow.service';
import { WorkflowDefinition } from '../../database/entities/workflow-definition.entity';
import { WorkflowNode } from '../../database/entities/workflow-node.entity';
import { WorkflowLine } from '../../database/entities/workflow-line.entity';

@Controller('workflow')
export class WorkflowController {
  constructor(private workflowService: WorkflowService) {}

  @Get('statistics')
  async getTaskStatistics(@Query('assigneeId') assigneeId?: string) {
    return this.workflowService.getTaskStatistics(assigneeId);
  }

  @Get('definitions')
  async findDefinitions(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    return this.workflowService.findDefinitions(page, pageSize);
  }

  @Get('definitions/:id')
  async getDefinitionDetail(@Param('id') id: string) {
    return this.workflowService.getDefinitionDetail(id);
  }

  @Post('definitions')
  async createDefinition(@Body() data: Partial<WorkflowDefinition>) {
    return this.workflowService.createDefinition(data);
  }

  @Put('definitions/:id')
  async updateDefinition(@Param('id') id: string, @Body() data: Partial<WorkflowDefinition>) {
    return this.workflowService.updateDefinition(id, data);
  }

  @Delete('definitions/:id')
  async deleteDefinition(@Param('id') id: string) {
    return this.workflowService.deleteDefinition(id);
  }

  @Post('definitions/:id/nodes')
  async saveNodes(
    @Param('id') id: string,
    @Body('workflowCode') workflowCode: string,
    @Body('nodes') nodes: Partial<WorkflowNode>[],
  ) {
    return this.workflowService.saveNodes(id, workflowCode, nodes);
  }

  @Get('definitions/:id/nodes')
  async findNodes(@Param('id') id: string) {
    return this.workflowService.findNodes(id);
  }

  @Post('definitions/:id/lines')
  async saveLines(
    @Param('id') id: string,
    @Body('lines') lines: Partial<WorkflowLine>[],
  ) {
    return this.workflowService.saveLines(id, lines);
  }

  @Get('definitions/:id/lines')
  async findLines(@Param('id') id: string) {
    return this.workflowService.findLines(id);
  }

  @Post('start')
  async startWorkflow(
    @Body('workflowCode') workflowCode: string,
    @Body('businessType') businessType: string,
    @Body('businessId') businessId: string,
    @Body('businessNo') businessNo: string,
    @Body('businessTitle') businessTitle: string,
    @Body('creatorId') creatorId: string,
    @Body('creatorName') creatorName: string,
  ) {
    return this.workflowService.startWorkflow(workflowCode, businessType, businessId, businessNo, businessTitle, creatorId, creatorName);
  }

  @Get('instances')
  async findInstances(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('businessType') businessType?: string,
    @Query('businessId') businessId?: string,
    @Query('status') status?: number,
  ) {
    return this.workflowService.findInstances(page, pageSize, businessType, businessId, status);
  }

  @Get('instances/:id')
  async getInstanceDetail(@Param('id') id: string) {
    return this.workflowService.getInstanceDetail(id);
  }

  @Get('instances/:id/history')
  async findHistory(@Param('id') id: string) {
    return this.workflowService.findHistory(id);
  }

  @Get('tasks')
  async findTasks(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('assigneeId') assigneeId?: string,
    @Query('status') status?: number,
  ) {
    return this.workflowService.findTasks(page, pageSize, assigneeId, status);
  }

  @Put('tasks/:id/approve')
  async approveTask(
    @Param('id') id: string,
    @Body('assigneeId') assigneeId: string,
    @Body('comment') comment?: string,
  ) {
    return this.workflowService.approveTask(id, assigneeId, comment);
  }

  @Put('tasks/:id/reject')
  async rejectTask(
    @Param('id') id: string,
    @Body('assigneeId') assigneeId: string,
    @Body('comment') comment?: string,
  ) {
    return this.workflowService.rejectTask(id, assigneeId, comment);
  }

  @Put('tasks/:id/delegate')
  async delegateTask(
    @Param('id') id: string,
    @Body('assigneeId') assigneeId: string,
    @Body('newAssigneeId') newAssigneeId: string,
    @Body('newAssigneeName') newAssigneeName: string,
  ) {
    return this.workflowService.delegateTask(id, assigneeId, newAssigneeId, newAssigneeName);
  }
}