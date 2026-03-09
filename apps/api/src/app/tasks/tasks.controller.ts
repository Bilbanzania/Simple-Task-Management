import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TasksService } from './tasks.service';
import { RolesGuard, Roles } from '@Simple Task Management/auth';
import { UserRole } from '@Simple Task Management/data';

interface AuthenticatedRequest extends Record<string, unknown> {
  user: {
    userId: string;
    email: string;
    role: UserRole;
    organizationId: string;
  };
}

@Controller('tasks')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('audit-log')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  getAuditLogs(@Request() req: AuthenticatedRequest) {
    return this.tasksService.getAuditLogs(req.user);
  }

  @Patch('reorder')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  reorder(
    @Request() req: AuthenticatedRequest,
    @Body() taskIds: string[]
  ) {
    return this.tasksService.reorder(req.user, taskIds);
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  create(
    @Request() req: AuthenticatedRequest, 
    @Body() body: { title: string; description: string; category?: string }
  ) {
    return this.tasksService.create(req.user, body.title, body.description, body.category);
  }

  @Get()
  findAll(@Request() req: AuthenticatedRequest) {
    return this.tasksService.findAll(req.user);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  update(
    @Request() req: AuthenticatedRequest, 
    @Param('id') id: string, 
    @Body() body: Record<string, unknown>
  ) {
    return this.tasksService.update(id, req.user, body);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER)
  remove(@Request() req: AuthenticatedRequest, @Param('id') id: string) {
    return this.tasksService.remove(id, req.user);
  }
}