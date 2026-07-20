import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SysTask } from '../../database/entities/sys-task.entity';
import { SysTaskComment } from '../../database/entities/sys-task-comment.entity';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(SysTask)
    private taskRepository: Repository<SysTask>,
    @InjectRepository(SysTaskComment)
    private commentRepository: Repository<SysTaskComment>,
  ) {}

  async generateTaskNo(): Promise<string> {
    const now = new Date();
    const prefix = 'TASK';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.taskRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async createTask(data: Partial<SysTask>): Promise<SysTask> {
    const taskNo = await this.generateTaskNo();
    const task = this.taskRepository.create({
      ...data,
      taskNo,
      status: 1,
      progress: 0,
    });
    return this.taskRepository.save(task);
  }

  async updateTask(id: string, data: Partial<SysTask>): Promise<SysTask> {
    const task = await this.taskRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!task) throw new NotFoundException('任务不存在');

    if (task.status === 3) {
      throw new BadRequestException('已完成的任务不允许修改');
    }

    Object.assign(task, data);
    return this.taskRepository.save(task);
  }

  async startTask(id: string): Promise<SysTask> {
    const task = await this.taskRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!task) throw new NotFoundException('任务不存在');

    if (task.status !== 1) {
      throw new BadRequestException('只能启动待处理状态的任务');
    }

    task.status = 2;
    task.startDate = new Date();
    return this.taskRepository.save(task);
  }

  async completeTask(id: string): Promise<SysTask> {
    const task = await this.taskRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!task) throw new NotFoundException('任务不存在');

    if (task.status !== 2) {
      throw new BadRequestException('只能完成进行中的任务');
    }

    task.status = 3;
    task.progress = 100;
    task.completionDate = new Date();
    return this.taskRepository.save(task);
  }

  async cancelTask(id: string): Promise<SysTask> {
    const task = await this.taskRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!task) throw new NotFoundException('任务不存在');

    if (task.status === 3) {
      throw new BadRequestException('已完成的任务不允许取消');
    }

    task.status = 4;
    return this.taskRepository.save(task);
  }

  async deleteTask(id: string): Promise<void> {
    const task = await this.taskRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!task) throw new NotFoundException('任务不存在');

    task.isDeleted = 1;
    await this.taskRepository.save(task);
  }

  async findTasks(page = 1, pageSize = 20, assigneeId?: string, status?: number, priority?: number): Promise<any> {
    const query = this.taskRepository.createQueryBuilder('t')
      .where('t.isDeleted = 0');

    if (assigneeId) {
      query.andWhere('t.assigneeId = :assigneeId', { assigneeId });
    }
    if (status !== undefined) {
      query.andWhere('t.status = :status', { status });
    }
    if (priority !== undefined) {
      query.andWhere('t.priority = :priority', { priority });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('t.priority', 'ASC')
      .addOrderBy('t.createdAt', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findTaskById(id: string): Promise<SysTask | null> {
    return this.taskRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async addComment(taskId: string, comment: string, commentUserId: string, commentUserName: string): Promise<SysTaskComment> {
    const task = await this.taskRepository.findOne({ where: { id: taskId, isDeleted: 0 } });
    if (!task) throw new NotFoundException('任务不存在');

    const taskComment = this.commentRepository.create({
      taskId,
      taskNo: task.taskNo,
      comment,
      commentUserId,
      commentUserName,
    });
    return this.commentRepository.save(taskComment);
  }

  async findComments(taskId: string): Promise<SysTaskComment[]> {
    return this.commentRepository.find({
      where: { taskId, isDeleted: 0 },
      order: { createdAt: 'DESC' },
    });
  }

  async deleteComment(commentId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({ where: { id: commentId, isDeleted: 0 } });
    if (!comment) throw new NotFoundException('评论不存在');

    comment.isDeleted = 1;
    await this.commentRepository.save(comment);
  }

  async getTaskDetail(id: string): Promise<any> {
    const task = await this.findTaskById(id);
    if (!task) throw new NotFoundException('任务不存在');

    const comments = await this.findComments(id);

    return {
      ...task,
      comments,
    };
  }

  async getStatistics(assigneeId?: string): Promise<any> {
    const query = this.taskRepository.createQueryBuilder('t')
      .where('t.isDeleted = 0');

    if (assigneeId) {
      query.andWhere('t.assigneeId = :assigneeId', { assigneeId });
    }

    const pendingCount = await query.clone().andWhere('t.status = 1').getCount();
    const inProgressCount = await query.clone().andWhere('t.status = 2').getCount();
    const completedCount = await query.clone().andWhere('t.status = 3').getCount();
    const cancelledCount = await query.clone().andWhere('t.status = 4').getCount();

    const priorityStats = await query.clone()
      .select(['t.priority', 'COUNT(*) as count'])
      .groupBy('t.priority')
      .getRawMany();

    return {
      pendingCount,
      inProgressCount,
      completedCount,
      cancelledCount,
      totalCount: pendingCount + inProgressCount + completedCount + cancelledCount,
      priorityDistribution: priorityStats,
    };
  }
}