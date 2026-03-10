import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../database/entities/task.entity';
import { AuditLog } from '../database/entities/audit-log.entity';
import { Comment } from '../database/entities/comment.entity';
import { UserRole, TaskStatus, ISubtask } from '@Simple Task Management/data';
import { TasksGateway } from './tasks.gateway';

interface UserPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

@Injectable()
export class TasksService {
  private readonly logger = new Logger('TasksService');

  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
    private tasksGateway: TasksGateway 
  ) { }

  private async logAction(user: UserPayload, action: string, resourceId: string, details: string) {
    await this.auditRepo.insert({ action, resourceId, details, organizationId: user.organizationId, actorId: user.userId });
    this.logger.log(`[AUDIT] ${action}: ${details} by ${user.email}`);
  }

  async create(user: UserPayload, title: string, description: string, category = 'Work', assigneeId?: string, dueDate?: Date, subtasks: ISubtask[] = []) {
    const count = await this.taskRepo.count({ where: { organizationId: user.organizationId } });
    let finalAssigneeId: string | null = user.userId;
    if (assigneeId !== undefined) finalAssigneeId = assigneeId === '' ? null : assigneeId;

    const result = await this.taskRepo.insert({ title, description, category, status: TaskStatus.TODO, organizationId: user.organizationId, assigneeId: finalAssigneeId, position: count, dueDate, subtasks });
    const newTaskId = result.identifiers[0].id;
    await this.logAction(user, 'CREATE_TASK', newTaskId, `Created task "${title}"`);

    const newTask = await this.taskRepo.findOne({ where: { id: newTaskId }, relations: ['assignee'] });

    this.tasksGateway.server.to(user.organizationId).emit('taskCreated', newTask);

    return newTask;
  }

  async findAll(user: UserPayload) {
    return this.taskRepo.find({ where: { organizationId: user.organizationId }, relations: ['assignee'], order: { position: 'ASC' } });
  }

  async reorder(user: UserPayload, taskIds: string[]) {
    if (user.role === UserRole.VIEWER) throw new ForbiddenException();
    for (let i = 0; i < taskIds.length; i++) {
      await this.taskRepo.update({ id: taskIds[i], organizationId: user.organizationId }, { position: i });
    }
    await this.logAction(user, 'REORDER_TASKS', 'N/A', `Reordered tasks`);

    this.tasksGateway.server.to(user.organizationId).emit('tasksReordered');
    return { success: true };
  }

  async getAuditLogs(user: UserPayload) {
    if (user.role === UserRole.VIEWER) throw new ForbiddenException();
    return this.auditRepo.find({ where: { organizationId: user.organizationId }, relations: ['actor'], order: { createdAt: 'DESC' }, take: 100 });
  }

  async update(id: string, user: UserPayload, updates: Partial<Task>) {
    if (user.role === UserRole.VIEWER) throw new ForbiddenException();
    await this.findOneSecure(id, user);
    await this.taskRepo.update({ id }, updates);
    const updatedTask = await this.findOneSecure(id, user);
    await this.logAction(user, 'UPDATE_TASK', id, `Updated task`);

    this.tasksGateway.server.to(user.organizationId).emit('taskUpdated', updatedTask);
    return updatedTask;
  }

  async remove(id: string, user: UserPayload) {
    await this.findOneSecure(id, user);
    if (user.role !== UserRole.OWNER) throw new ForbiddenException();
    await this.taskRepo.delete({ id });
    await this.logAction(user, 'DELETE_TASK', id, `Deleted task`);

    this.tasksGateway.server.to(user.organizationId).emit('taskDeleted', id);
    return { success: true, id };
  }

  async getComments(taskId: string, user: UserPayload) {
    await this.findOneSecure(taskId, user);
    return this.commentRepo.find({ where: { taskId }, relations: ['author'], order: { createdAt: 'DESC' } });
  }

  async addComment(taskId: string, user: UserPayload, content: string) {
    await this.findOneSecure(taskId, user);
    const result = await this.commentRepo.insert({ taskId, authorId: user.userId, content });
    const newComment = await this.commentRepo.findOne({ where: { id: result.identifiers[0].id }, relations: ['author'] });

    await this.logAction(user, 'ADD_COMMENT', taskId, `Added a comment`);

    this.tasksGateway.server.to(user.organizationId).emit('commentAdded', { taskId, comment: newComment });
    return newComment;
  }

  private async findOneSecure(id: string, user: UserPayload): Promise<Task> {
    const task = await this.taskRepo.findOne({
      where: { id },
      relations: ['assignee']
    });
    if (!task || task.organizationId !== user.organizationId) throw new NotFoundException();
    return task;
  }
}