import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { TaskService } from './task.service';
import { SysTask } from '../../database/entities/sys-task.entity';

@Controller('tasks')
export class TaskController {
  constructor(private taskService: TaskService) {}

  @Get('statistics')
  async getStatistics(@Query('assigneeId') assigneeId?: string) {
    return this.taskService.getStatistics(assigneeId);
  }

  @Get()
  async findTasks(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 20,
    @Query('assigneeId') assigneeId?: string,
    @Query('status') status?: number,
    @Query('priority') priority?: number,
  ) {
    return this.taskService.findTasks(page, pageSize, assigneeId, status, priority);
  }

  @Get(':id')
  async getTaskDetail(@Param('id') id: string) {
    return this.taskService.getTaskDetail(id);
  }

  @Post()
  async createTask(@Body() data: Partial<SysTask>) {
    return this.taskService.createTask(data);
  }

  @Put(':id')
  async updateTask(@Param('id') id: string, @Body() data: Partial<SysTask>) {
    return this.taskService.updateTask(id, data);
  }

  @Put(':id/start')
  async startTask(@Param('id') id: string) {
    return this.taskService.startTask(id);
  }

  @Put(':id/complete')
  async completeTask(@Param('id') id: string) {
    return this.taskService.completeTask(id);
  }

  @Put(':id/cancel')
  async cancelTask(@Param('id') id: string) {
    return this.taskService.cancelTask(id);
  }

  @Delete(':id')
  async deleteTask(@Param('id') id: string) {
    return this.taskService.deleteTask(id);
  }

  @Get(':id/comments')
  async findComments(@Param('id') id: string) {
    return this.taskService.findComments(id);
  }

  @Post(':id/comments')
  async addComment(
    @Param('id') id: string,
    @Body('comment') comment: string,
    @Body('commentUserId') commentUserId: string,
    @Body('commentUserName') commentUserName: string,
  ) {
    return this.taskService.addComment(id, comment, commentUserId, commentUserName);
  }

  @Delete('comments/:id')
  async deleteComment(@Param('id') id: string) {
    return this.taskService.deleteComment(id);
  }
}