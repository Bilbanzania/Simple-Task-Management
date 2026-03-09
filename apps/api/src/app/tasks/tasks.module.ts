import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { Task } from '../database/entities/task.entity';
import { AuditLog } from '../database/entities/audit-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, AuditLog]), 
  ],
  controllers: [TasksController],
  providers: [TasksService],
  exports: [TasksService],
})
export class TasksModule {}