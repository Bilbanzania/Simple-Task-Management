import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ITask, ISubtask } from '@Simple Task Management/data'; 
import { tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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
  private apiUrl = '/api/tasks';

  tasks = signal<ITask[]>([]);
  isSyncing = signal<boolean>(false);

  loadTasks() {
    this.http.get<ITask[]>(this.apiUrl).subscribe(data => {
      this.tasks.set(data);
    });
  }

  getAuditLogs() {
    return this.http.get<IAuditLog[]>(`${this.apiUrl}/audit-log`);
  }

  reorder(taskIds: string[]) {
    this.isSyncing.set(true);

    return this.http.patch(`${this.apiUrl}/reorder`, taskIds).pipe(
      tap(() => {
        this.isSyncing.set(false);
      }),
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
    this.tasks.update(currentTasks =>
      currentTasks.map(t => t.id === id ? { ...t, ...updates } : t)
    );

    return this.http.patch<ITask>(`${this.apiUrl}/${id}`, updates).pipe(
      catchError(err => {
        console.error('Update failed', err);
        this.loadTasks();
        return of(null);
      })
    );
  }

  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => this.loadTasks())
    );
  }
}