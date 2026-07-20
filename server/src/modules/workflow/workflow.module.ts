import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkflowController } from './workflow.controller';
import { WorkflowService } from './workflow.service';
import { WorkflowDefinition } from '../../database/entities/workflow-definition.entity';
import { WorkflowNode } from '../../database/entities/workflow-node.entity';
import { WorkflowLine } from '../../database/entities/workflow-line.entity';
import { WorkflowInstance } from '../../database/entities/workflow-instance.entity';
import { WorkflowTask } from '../../database/entities/workflow-task.entity';
import { WorkflowHistory } from '../../database/entities/workflow-history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WorkflowDefinition, WorkflowNode, WorkflowLine, WorkflowInstance, WorkflowTask, WorkflowHistory])],
  controllers: [WorkflowController],
  providers: [WorkflowService],
})
export class WorkflowModule {}