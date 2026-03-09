import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService, IAuditLog } from '../core/task.service';
import { AppComponent } from '../app.component';
import { TimeAgoPipe } from '../core/time-ago.pipe';

@Component({
    selector: 'app-audit-log',
    standalone: true,
    imports: [CommonModule, RouterModule, TimeAgoPipe],
    templateUrl: './audit-log.component.html',
})
export class AuditLogComponent implements OnInit {
    taskService = inject(TaskService);
    app = inject(AppComponent);

    logs = signal<IAuditLog[]>([]);
    isLoading = signal<boolean>(true);
    isDarkMode = this.app.isDarkMode;

    ngOnInit() {
        this.taskService.getAuditLogs().subscribe({
            next: (data) => {
                this.logs.set(data);
                this.isLoading.set(false);
            },
            error: (err) => {
                console.error('Failed to load logs', err);
                this.isLoading.set(false);
            }
        });
    }

    toggleDarkMode() {
        this.app.toggleTheme();
    }
}