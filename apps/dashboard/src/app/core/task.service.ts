import { Injectable, signal, inject, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ITask, ISubtask, IComment } from '@Simple Task Management/data';
import { tap, catchError } from 'rxjs/operators';
import { of, Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';

export interface IAuditLog {
  id: string;
  action: string;
  details: string;
  createdAt: string | Date;
  actor?: {
    email: string;
    role: string;
  };
}

@Injectable({ providedIn: 'root' })
export class TaskService {
  private http = inject(HttpClient);
  private zone = inject(NgZone); 
  private apiUrl = '/api/tasks';

  tasks = signal<ITask[]>([]);
  isSyncing = signal<boolean>(false);

  private socket?: Socket;
  public commentAdded$ = new Subject<{ taskId: string, comment: IComment }>();

  initSocket(orgId: string) {
    if (this.socket) return;
    this.socket = io({ transports: ['websocket', 'polling'] });

    this.socket.on('connect', () => {
      this.socket?.emit('joinOrganization', orgId);
    });

    this.socket.on('taskCreated', (task: ITask) => {
      this.zone.run(() => this.tasks.update(t => [...t, task]));
    });

    this.socket.on('taskUpdated', (task: ITask) => {
      this.zone.run(() => this.tasks.update(t => t.map(existing => existing.id === task.id ? task : existing)));
    });

    this.socket.on('taskDeleted', (taskId: string) => {
      this.zone.run(() => this.tasks.update(t => t.filter(existing => existing.id !== taskId)));
    });

    this.socket.on('tasksReordered', () => {
      this.zone.run(() => this.loadTasks());
    });

    this.socket.on('commentAdded', (payload: { taskId: string, comment: IComment }) => {
      this.zone.run(() => this.commentAdded$.next(payload));
    });
  }

  disconnectSocket() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = undefined;
    }
  }

  loadTasks() {
    this.http.get<ITask[]>(this.apiUrl).subscribe(data => this.tasks.set(data));
  }

  getAuditLogs() {
    return this.http.get<IAuditLog[]>(`${this.apiUrl}/audit-log`);
  }

  getComments(taskId: string) {
    return this.http.get<IComment[]>(`${this.apiUrl}/${taskId}/comments`);
  }

  addComment(taskId: string, content: string) {
    return this.http.post<IComment>(`${this.apiUrl}/${taskId}/comments`, { content });
  }

  reorder(taskIds: string[]) {
    this.isSyncing.set(true);
    return this.http.patch(`${this.apiUrl}/reorder`, taskIds).pipe(
      tap(() => this.isSyncing.set(false)),
      catchError(err => {
        this.isSyncing.set(false);
        console.error('Reorder failed', err);
        return of(null);
      })
    );
  }

  create(title: string, description: string, category: string, assigneeId?: string, dueDate?: Date | null, subtasks: ISubtask[] = []) {
    return this.http.post<ITask>(this.apiUrl, { title, description, category, assigneeId, dueDate, subtasks }).pipe(
      tap(() => this.loadTasks())
    );
  }

  update(id: string, updates: Partial<ITask>) {
    this.tasks.update(currentTasks => currentTasks.map(t => t.id === id ? { ...t, ...updates } : t));
    return this.http.patch<ITask>(`${this.apiUrl}/${id}`, updates).pipe(
      catchError(err => {
        console.error('Update failed', err);
        this.loadTasks();
        return of(null);
      })
    );
  }

  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(tap(() => this.loadTasks()));
  }
}