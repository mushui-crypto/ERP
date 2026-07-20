import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WorkflowDefinition } from '../../database/entities/workflow-definition.entity';
import { WorkflowNode } from '../../database/entities/workflow-node.entity';
import { WorkflowLine } from '../../database/entities/workflow-line.entity';
import { WorkflowInstance } from '../../database/entities/workflow-instance.entity';
import { WorkflowTask } from '../../database/entities/workflow-task.entity';
import { WorkflowHistory } from '../../database/entities/workflow-history.entity';

@Injectable()
export class WorkflowService {
  constructor(
    @InjectRepository(WorkflowDefinition)
    private definitionRepository: Repository<WorkflowDefinition>,
    @InjectRepository(WorkflowNode)
    private nodeRepository: Repository<WorkflowNode>,
    @InjectRepository(WorkflowLine)
    private lineRepository: Repository<WorkflowLine>,
    @InjectRepository(WorkflowInstance)
    private instanceRepository: Repository<WorkflowInstance>,
    @InjectRepository(WorkflowTask)
    private taskRepository: Repository<WorkflowTask>,
    @InjectRepository(WorkflowHistory)
    private historyRepository: Repository<WorkflowHistory>,
  ) {}

  async generateInstanceNo(): Promise<string> {
    const now = new Date();
    const prefix = 'WI';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.instanceRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async generateTaskNo(): Promise<string> {
    const now = new Date();
    const prefix = 'WT';
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const count = await this.taskRepository.count({ where: { isDeleted: 0 } });
    return `${prefix}${dateStr}${String(count + 1).padStart(4, '0')}`;
  }

  async createDefinition(data: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    const existing = await this.definitionRepository.findOne({
      where: { workflowCode: data.workflowCode, isDeleted: 0 },
    });
    if (existing) {
      throw new ConflictException('流程编码已存在');
    }

    const definition = this.definitionRepository.create({
      ...data,
      isEnabled: 1,
      version: 1,
    });
    return this.definitionRepository.save(definition);
  }

  async updateDefinition(id: string, data: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
    const definition = await this.definitionRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!definition) throw new NotFoundException('流程定义不存在');
    Object.assign(definition, data);
    return this.definitionRepository.save(definition);
  }

  async deleteDefinition(id: string): Promise<void> {
    const definition = await this.definitionRepository.findOne({ where: { id, isDeleted: 0 } });
    if (!definition) throw new NotFoundException('流程定义不存在');

    const hasInstances = await this.instanceRepository.count({ where: { workflowId: id, isDeleted: 0 } });
    if (hasInstances > 0) {
      throw new BadRequestException('存在运行中的流程实例，不允许删除');
    }

    definition.isDeleted = 1;
    await this.definitionRepository.save(definition);

    await this.nodeRepository.update({ workflowId: id }, { isDeleted: 1 });
    await this.lineRepository.update({ workflowId: id }, { isDeleted: 1 });
  }

  async findDefinitions(page = 1, pageSize = 20): Promise<any> {
    const [list, total] = await this.definitionRepository.findAndCount({
      where: { isDeleted: 0 },
      skip: (page - 1) * pageSize,
      take: pageSize,
      order: { createdAt: 'DESC' },
    });
    return { list, total, page, pageSize };
  }

  async findDefinitionById(id: string): Promise<WorkflowDefinition | null> {
    return this.definitionRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findDefinitionByCode(workflowCode: string): Promise<WorkflowDefinition | null> {
    return this.definitionRepository.findOne({ where: { workflowCode, isDeleted: 0 } });
  }

  async saveNodes(workflowId: string, workflowCode: string, nodes: Partial<WorkflowNode>[]): Promise<void> {
    await this.nodeRepository.update({ workflowId }, { isDeleted: 1 });

    for (const node of nodes) {
      const existing = await this.nodeRepository.findOne({
        where: { workflowId, nodeCode: node.nodeCode },
      });
      if (existing) {
        existing.isDeleted = 0;
        Object.assign(existing, node);
        await this.nodeRepository.save(existing);
      } else {
        await this.nodeRepository.save({
          ...node,
          workflowId,
          workflowCode,
        });
      }
    }
  }

  async saveLines(workflowId: string, lines: Partial<WorkflowLine>[]): Promise<void> {
    await this.lineRepository.update({ workflowId }, { isDeleted: 1 });

    for (const line of lines) {
      await this.lineRepository.save({ ...line, workflowId });
    }
  }

  async findNodes(workflowId: string): Promise<WorkflowNode[]> {
    return this.nodeRepository.find({ where: { workflowId, isDeleted: 0 }, order: { sortOrder: 'ASC' } });
  }

  async findLines(workflowId: string): Promise<WorkflowLine[]> {
    return this.lineRepository.find({ where: { workflowId, isDeleted: 0 } });
  }

  async getDefinitionDetail(id: string): Promise<any> {
    const definition = await this.findDefinitionById(id);
    if (!definition) throw new NotFoundException('流程定义不存在');

    const nodes = await this.findNodes(id);
    const lines = await this.findLines(id);

    return {
      ...definition,
      nodes,
      lines,
    };
  }

  async startWorkflow(workflowCode: string, businessType: string, businessId: string, businessNo: string, businessTitle: string, creatorId: string, creatorName: string): Promise<WorkflowInstance> {
    const definition = await this.findDefinitionByCode(workflowCode);
    if (!definition) throw new NotFoundException('流程定义不存在');

    if (!definition.isEnabled) {
      throw new BadRequestException('流程未启用');
    }

    const instanceNo = await this.generateInstanceNo();
    const nodes = await this.findNodes(definition.id);
    const startNode = nodes.find(n => n.nodeType === 'start');
    if (!startNode) {
      throw new BadRequestException('流程缺少开始节点');
    }

    const instance = this.instanceRepository.create({
      instanceNo,
      workflowId: definition.id,
      workflowCode: definition.workflowCode,
      workflowName: definition.workflowName,
      businessType,
      businessId,
      businessNo,
      businessTitle,
      creatorId,
      creatorName,
      currentNodeId: startNode.id,
      currentNodeName: startNode.nodeName,
      status: 1,
      startTime: new Date(),
    });

    const savedInstance = await this.instanceRepository.save(instance);

    await this.addHistory(savedInstance.id, savedInstance.instanceNo, startNode.id, startNode.nodeCode, startNode.nodeName, 'start', creatorId, creatorName, businessType, businessId);

    await this.flowToNextNode(savedInstance);

    return savedInstance;
  }

  async flowToNextNode(instance: WorkflowInstance): Promise<void> {
    const nodes = await this.findNodes(instance.workflowId);
    const lines = await this.findLines(instance.workflowId);

    const currentNode = nodes.find(n => n.id === instance.currentNodeId);
    if (!currentNode) return;

    if (currentNode.nodeType === 'end') {
      instance.status = 2;
      instance.endTime = new Date();
      await this.instanceRepository.save(instance);
      return;
    }

    const nextLines = lines.filter(l => l.sourceNodeId === instance.currentNodeId && l.isDeleted === 0);
    if (nextLines.length === 0) return;

    const defaultLine = nextLines.find(l => l.isDefault === 1) || nextLines[0];
    const nextNode = nodes.find(n => n.id === defaultLine.targetNodeId);

    if (nextNode) {
      instance.currentNodeId = nextNode.id;
      instance.currentNodeName = nextNode.nodeName;
      await this.instanceRepository.save(instance);

      await this.createTask(instance, nextNode);
    }
  }

  async createTask(instance: WorkflowInstance, node: WorkflowNode): Promise<WorkflowTask> {
    const taskNo = await this.generateTaskNo();
    
    const assigneeIds = node.assigneeIds ? node.assigneeIds.split(',') : [];
    
    const tasks: WorkflowTask[] = [];
    for (const assigneeId of assigneeIds) {
      const assigneeNames = node.assigneeNames ? node.assigneeNames.split(',') : [];
      const assigneeIndex = assigneeIds.indexOf(assigneeId);
      const assigneeName = assigneeNames[assigneeIndex] || '';

      const task = this.taskRepository.create({
        taskNo: `${taskNo}-${assigneeIndex + 1}`,
        instanceId: instance.id,
        instanceNo: instance.instanceNo,
        workflowId: instance.workflowId,
        workflowCode: instance.workflowCode,
        nodeId: node.id,
        nodeCode: node.nodeCode,
        nodeName: node.nodeName,
        businessType: instance.businessType,
        businessId: instance.businessId,
        businessNo: instance.businessNo,
        businessTitle: instance.businessTitle,
        assigneeId,
        assigneeName,
        status: 1,
        priority: node.nodeType === 'approval' ? 1 : 2,
        createTime: new Date(),
      });

      if (node.timeoutHours) {
        const timeoutTime = new Date();
        timeoutTime.setHours(timeoutTime.getHours() + node.timeoutHours);
        task.timeoutTime = timeoutTime;
      }

      tasks.push(await this.taskRepository.save(task));
    }

    return tasks[0];
  }

  async approveTask(taskId: string, assigneeId: string, comment?: string): Promise<WorkflowTask> {
    const task = await this.taskRepository.findOne({ where: { id: taskId, isDeleted: 0 } });
    if (!task) throw new NotFoundException('任务不存在');

    if (task.status !== 1) {
      throw new BadRequestException('任务状态不允许操作');
    }

    if (task.assigneeId !== assigneeId) {
      throw new BadRequestException('无权处理该任务');
    }

    task.status = 2;
    task.action = 'approve';
    task.comment = comment;
    task.completeTime = new Date();
    const savedTask = await this.taskRepository.save(task);

    await this.addHistory(task.instanceId, task.instanceNo, task.nodeId, task.nodeCode, task.nodeName, 'approve', assigneeId, task.assigneeName, task.businessType, task.businessId);

    const instance = await this.instanceRepository.findOne({ where: { id: task.instanceId, isDeleted: 0 } });
    if (instance) {
      await this.flowToNextNode(instance);
    }

    return savedTask;
  }

  async rejectTask(taskId: string, assigneeId: string, comment?: string): Promise<WorkflowTask> {
    const task = await this.taskRepository.findOne({ where: { id: taskId, isDeleted: 0 } });
    if (!task) throw new NotFoundException('任务不存在');

    if (task.status !== 1) {
      throw new BadRequestException('任务状态不允许操作');
    }

    if (task.assigneeId !== assigneeId) {
      throw new BadRequestException('无权处理该任务');
    }

    task.status = 2;
    task.action = 'reject';
    task.comment = comment;
    task.completeTime = new Date();
    const savedTask = await this.taskRepository.save(task);

    await this.addHistory(task.instanceId, task.instanceNo, task.nodeId, task.nodeCode, task.nodeName, 'reject', assigneeId, task.assigneeName, task.businessType, task.businessId);

    const instance = await this.instanceRepository.findOne({ where: { id: task.instanceId, isDeleted: 0 } });
    if (instance) {
      instance.status = 4;
      instance.endTime = new Date();
      await this.instanceRepository.save(instance);
    }

    return savedTask;
  }

  async delegateTask(taskId: string, assigneeId: string, newAssigneeId: string, newAssigneeName: string): Promise<WorkflowTask> {
    const task = await this.taskRepository.findOne({ where: { id: taskId, isDeleted: 0 } });
    if (!task) throw new NotFoundException('任务不存在');

    if (task.status !== 1) {
      throw new BadRequestException('任务状态不允许操作');
    }

    if (task.assigneeId !== assigneeId) {
      throw new BadRequestException('无权处理该任务');
    }

    task.status = 3;
    task.action = 'delegate';
    task.completeTime = new Date();
    await this.taskRepository.save(task);

    await this.addHistory(task.instanceId, task.instanceNo, task.nodeId, task.nodeCode, task.nodeName, 'delegate', assigneeId, task.assigneeName, task.businessType, task.businessId);

    const newTaskNo = await this.generateTaskNo();
    const newTask = this.taskRepository.create({
      taskNo: newTaskNo,
      instanceId: task.instanceId,
      instanceNo: task.instanceNo,
      workflowId: task.workflowId,
      workflowCode: task.workflowCode,
      nodeId: task.nodeId,
      nodeCode: task.nodeCode,
      nodeName: task.nodeName,
      businessType: task.businessType,
      businessId: task.businessId,
      businessNo: task.businessNo,
      businessTitle: task.businessTitle,
      assigneeId: newAssigneeId,
      assigneeName: newAssigneeName,
      status: 1,
      priority: task.priority,
      createTime: new Date(),
      timeoutTime: task.timeoutTime,
    });

    return this.taskRepository.save(newTask);
  }

  async addHistory(instanceId: string, instanceNo: string, nodeId: string, nodeCode: string, nodeName: string, action: string, operatorId: string, operatorName: string, businessType: string, businessId: string): Promise<void> {
    await this.historyRepository.save({
      instanceId,
      instanceNo,
      nodeId,
      nodeCode,
      nodeName,
      action,
      operatorId,
      operatorName,
      operateTime: new Date(),
      businessType,
      businessId,
    });
  }

  async findTasks(page = 1, pageSize = 20, assigneeId?: string, status?: number): Promise<any> {
    const query = this.taskRepository.createQueryBuilder('t')
      .where('t.isDeleted = 0');

    if (assigneeId) {
      query.andWhere('t.assigneeId = :assigneeId', { assigneeId });
    }
    if (status !== undefined) {
      query.andWhere('t.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('t.createTime', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findInstances(page = 1, pageSize = 20, businessType?: string, businessId?: string, status?: number): Promise<any> {
    const query = this.instanceRepository.createQueryBuilder('i')
      .where('i.isDeleted = 0');

    if (businessType) {
      query.andWhere('i.businessType = :businessType', { businessType });
    }
    if (businessId) {
      query.andWhere('i.businessId = :businessId', { businessId });
    }
    if (status !== undefined) {
      query.andWhere('i.status = :status', { status });
    }

    const [list, total] = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .orderBy('i.startTime', 'DESC')
      .getManyAndCount();

    return { list, total, page, pageSize };
  }

  async findInstanceById(id: string): Promise<WorkflowInstance | null> {
    return this.instanceRepository.findOne({ where: { id, isDeleted: 0 } });
  }

  async findHistory(instanceId: string): Promise<WorkflowHistory[]> {
    return this.historyRepository.find({
      where: { instanceId, isDeleted: 0 },
      order: { operateTime: 'ASC' },
    });
  }

  async getInstanceDetail(id: string): Promise<any> {
    const instance = await this.findInstanceById(id);
    if (!instance) throw new NotFoundException('流程实例不存在');

    const tasks = await this.taskRepository.find({
      where: { instanceId: id, isDeleted: 0 },
      order: { createTime: 'ASC' },
    });

    const history = await this.findHistory(id);

    return {
      ...instance,
      tasks,
      history,
    };
  }

  async getTaskStatistics(assigneeId?: string): Promise<any> {
    const query = this.taskRepository.createQueryBuilder('t')
      .where('t.isDeleted = 0');

    if (assigneeId) {
      query.andWhere('t.assigneeId = :assigneeId', { assigneeId });
    }

    const pendingCount = await query.clone().andWhere('t.status = 1').getCount();
    const completedCount = await query.clone().andWhere('t.status = 2').getCount();
    const delegatedCount = await query.clone().andWhere('t.status = 3').getCount();
    const timeoutCount = await query.clone().andWhere('t.status = 4').getCount();

    return {
      pendingCount,
      completedCount,
      delegatedCount,
      timeoutCount,
      totalCount: pendingCount + completedCount + delegatedCount + timeoutCount,
    };
  }
}