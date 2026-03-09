import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { AuthResponse, IUser } from '@Simple Task Management/data';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = '/api/auth';
  
  currentUser = signal<IUser | null>(null);

  constructor() {
    const savedUser = localStorage.getItem('user');
    
    if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
      try {
        const parsedUser = JSON.parse(savedUser);
        if (parsedUser && parsedUser.id) {
          this.currentUser.set(parsedUser);
        } else {
          this.logout();
        }
      } catch {
        this.logout();
      }
    } else {
      this.currentUser.set(null);
    }
  }

  login(credentials: Record<string, unknown>) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  register(data: Record<string, unknown>) {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data).pipe(
      tap(res => this.handleAuth(res))
    );
  }

  private handleAuth(res: AuthResponse) {
    const rawResponse = res as unknown as Record<string, string>;
    const token = res.accessToken || rawResponse['access_token'] || rawResponse['token'];
    
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(res.user));
      this.currentUser.set(res.user);
      this.router.navigate(['/tasks']);
    }
  }

  getToken() {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }
}