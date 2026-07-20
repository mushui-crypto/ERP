import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { SysTask } from '../../database/entities/sys-task.entity';
import { SysTaskComment } from '../../database/entities/sys-task-comment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SysTask, SysTaskComment])],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}