import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from '../database/entities/task.entity';
import { AuditLog } from '../database/entities/audit-log.entity';
import { Comment } from '../database/entities/comment.entity';
import { TasksGateway } from './tasks.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Task, AuditLog, Comment])],
  controllers: [TasksController],
  providers: [TasksService, TasksGateway],
})
export class TasksModule { }