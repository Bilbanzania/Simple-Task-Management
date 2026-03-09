import { Component, OnInit, inject, signal, effect } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './core/auth.service';
import { TaskService } from './core/task.service';

@Component({
  standalone: true,
  imports: [RouterModule, CommonModule],
  selector: 'app-root',
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  private authService = inject(AuthService);
  private taskService = inject(TaskService);

  // Initialize signal by checking if localStorage specifically says 'dark'
  isDarkMode = signal(localStorage.getItem('theme') === 'dark');

  constructor() {
    effect(() => {
      const isDark = this.isDarkMode();

      localStorage.setItem('theme', isDark ? 'dark' : 'light');

      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    });
  }

  toggleTheme() {
    this.isDarkMode.update(v => !v);
  }

  ngOnInit() {
    const user = this.authService.currentUser();
    if (user) {
      this.taskService.loadTasks();
    }
  }
}