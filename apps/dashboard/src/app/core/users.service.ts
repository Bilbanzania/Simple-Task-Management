import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { UserRole } from '@Simple Task Management/data';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private http = inject(HttpClient);
  private apiUrl = '/api/users';
  users = signal<User[]>([]);
  loading = signal<boolean>(false);

  loadUsers() {
    this.loading.set(true);
    this.http.get<User[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.users.set(data);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  createUser(email: string, password: string, role: UserRole) {
    return this.http.post<User>(this.apiUrl, { email, password, role }).pipe(
      tap((newUser) => {
        this.users.update(list => [newUser, ...list]);
      })
    );
  }

  deleteUser(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`).pipe(
      tap(() => {
        this.users.update(list => list.filter(u => u.id !== id));
      })
    );
  }
}