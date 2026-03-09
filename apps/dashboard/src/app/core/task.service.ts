import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ITask, TaskStatus } from '@Simple Task Management/data';
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

  create(title: string, description: string, category: string) {
    return this.http.post<ITask>(this.apiUrl, { title, description, category }).pipe(
      tap(() => this.loadTasks())
    );
  }

  update(id: string, status: TaskStatus) {
    this.tasks.update(currentTasks =>
      currentTasks.map(t => t.id === id ? { ...t, status } : t)
    );

    return this.http.patch<ITask>(`${this.apiUrl}/${id}`, { status }).pipe(
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