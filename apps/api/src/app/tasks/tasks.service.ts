import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../database/entities/task.entity';
import { AuditLog } from '../database/entities/audit-log.entity';
import { UserRole, TaskStatus } from '@Simple Task Management/data';

interface UserPayload {
  userId: string;
  email: string;
  role: UserRole;
  organizationId: string;
}

@Injectable()
export class TasksService {
  private readonly logger = new Logger('AuditService');

  constructor(
    @InjectRepository(Task) private taskRepo: Repository<Task>,
    @InjectRepository(AuditLog) private auditRepo: Repository<AuditLog>,
  ) { }

  private async logAction(user: UserPayload, action: string, resourceId: string, details: string) {
    await this.auditRepo.insert({
      action,
      resourceId,
      details,
      organizationId: user.organizationId,
      actorId: user.userId,
    });

    this.logger.log(`[AUDIT] ${action}: ${details} by ${user.email}`);
  }

  async create(user: UserPayload, title: string, description: string, category = 'Work', assigneeId?: string) {
    const count = await this.taskRepo.count({ where: { organizationId: user.organizationId } });

    let finalAssigneeId: string | null = user.userId;
    if (assigneeId !== undefined) {
      finalAssigneeId = assigneeId === '' ? null : assigneeId;
    }

    const result = await this.taskRepo.insert({
      title,
      description,
      category,
      status: TaskStatus.TODO,
      organizationId: user.organizationId,
      assigneeId: finalAssigneeId,
      position: count
    });

    const newTaskId = result.identifiers[0].id;
    await this.logAction(user, 'CREATE_TASK', newTaskId, `Created task "${title}"`);

    return this.taskRepo.findOne({ where: { id: newTaskId }, relations: ['assignee'] });
  }

  async findAll(user: UserPayload) {
    return this.taskRepo.find({
      where: { organizationId: user.organizationId },
      relations: ['assignee'],
      order: { position: 'ASC' }
    });
  }

  async reorder(user: UserPayload, taskIds: string[]) {
    if (user.role === UserRole.VIEWER) throw new ForbiddenException();

    for (let i = 0; i < taskIds.length; i++) {
      await this.taskRepo.update(
        { id: taskIds[i], organizationId: user.organizationId },
        { position: i }
      );
    }

    await this.logAction(user, 'REORDER_TASKS', 'N/A', `Reordered tasks`);
    return { success: true };
  }

  async getAuditLogs(user: UserPayload) {
    if (user.role === UserRole.VIEWER) throw new ForbiddenException();
    return this.auditRepo.find({
      where: { organizationId: user.organizationId },
      relations: ['actor'],
      order: { createdAt: 'DESC' },
      take: 100
    });
  }

  async update(id: string, user: UserPayload, updates: Partial<Task>) {
    if (user.role === UserRole.VIEWER) throw new ForbiddenException();
    await this.findOneSecure(id, user);

    await this.taskRepo.update({ id }, updates);

    const updatedTask = await this.findOneSecure(id, user);
    await this.logAction(user, 'UPDATE_TASK', id, `Updated task`);
    return updatedTask;
  }

  async remove(id: string, user: UserPayload) {
    await this.findOneSecure(id, user);
    if (user.role !== UserRole.OWNER) throw new ForbiddenException();

    await this.taskRepo.delete({ id });
    await this.logAction(user, 'DELETE_TASK', id, `Deleted task`);
    return { success: true, id };
  }

  private async findOneSecure(id: string, user: UserPayload): Promise<Task> {
    const task = await this.taskRepo.findOne({ where: { id } });
    if (!task || task.organizationId !== user.organizationId) throw new NotFoundException();
    return task;
  }
}