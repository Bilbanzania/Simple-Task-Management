import { Component, inject } from '@angular/core';
import { AppComponent } from './app.component';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  template: `
    <button (click)="app.toggleTheme()" class="fixed top-4 right-4 p-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm z-50">
      {{ app.isDarkMode() ? '☀️' : '🌙' }}
    </button>
  `,
})
export class ThemeToggleComponent {
  app = inject(AppComponent);
}