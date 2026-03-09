import { Route } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { TaskListComponent } from './task-list/task-list.component';
import { TeamManagementComponent } from './team-management/team-management.component';
import { authGuard } from './core/auth.guard';
import { AuditLogComponent } from './audit-log/audit-log.component';

export const appRoutes: Route[] = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  {
    path: 'tasks',
    component: TaskListComponent,
    canActivate: [authGuard]
  },

  {
    path: 'team',
    component: TeamManagementComponent,
    canActivate: [authGuard]
  },

  { 
    path: 'logs', 
    component: AuditLogComponent,
    canActivate: [authGuard] 
  },

  { path: '**', redirectTo: 'login' }
];