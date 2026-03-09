import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UsersService, User } from '../core/users.service';
import { AuthService } from '../core/auth.service';
import { AppComponent } from '../app.component';
import { UserRole } from '@Simple Task Management/data';

@Component({
  selector: 'app-team-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './team-management.component.html',
})
export class TeamManagementComponent {
  usersService = inject(UsersService);
  auth = inject(AuthService);
  app = inject(AppComponent);

  newUserEmail = '';
  newUserPassword = '';
  newUserRole: UserRole = UserRole.VIEWER;
  UserRole = UserRole;
  roles = Object.values(UserRole);

  errorMessage = signal('');

  isDarkMode = this.app.isDarkMode;

  constructor() {
    this.usersService.loadUsers();
  }

  toggleDarkMode() {
    this.app.toggleTheme();
  }

  createUser() {
    if (!this.newUserEmail || !this.newUserPassword) return;

    this.usersService.createUser(this.newUserEmail, this.newUserPassword, this.newUserRole)
      .subscribe({
        next: () => {
          this.newUserEmail = '';
          this.newUserPassword = '';
          this.newUserRole = UserRole.VIEWER;
          this.errorMessage.set('');
        },
        error: (err) => {
          this.errorMessage.set(err.error?.message || 'Failed to create user');
        }
      });
  }

  deleteUser(user: User) {
    if (user.role === UserRole.OWNER && user.email === this.auth.currentUser()?.email) {
      alert("You cannot delete yourself!");
      return;
    }

    if (!confirm(`Are you sure you want to remove ${user.email}? This cannot be undone.`)) {
      return;
    }

    this.usersService.deleteUser(user.id).subscribe({
      error: (err) => this.errorMessage.set(err.error?.message || 'Could not delete user')
    });
  }
}