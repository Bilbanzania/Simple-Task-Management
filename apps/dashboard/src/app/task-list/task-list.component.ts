import { Component, inject, OnInit, computed, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { TaskService } from '../core/task.service';
import { AuthService } from '../core/auth.service';
import { AppComponent } from '../app.component';
import { UserRole, TaskStatus, ITask } from '@Simple Task Management/data';

@Component({
  selector: 'app-task-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,
    RouterModule
  ],
  templateUrl: './task-list.component.html',
})
export class TaskListComponent implements OnInit {
  UserRole = UserRole;
  TaskStatus = TaskStatus;
  taskService = inject(TaskService);
  auth = inject(AuthService);
  app = inject(AppComponent);

  newTaskTitle = '';
  newTaskDescription = '';
  newTaskCategory = 'Work';

  isDarkMode = this.app.isDarkMode;

  canEdit = computed(() => {
    const role = this.auth.currentUser()?.role;
    return role === UserRole.OWNER || role === UserRole.ADMIN;
  });

  completionRate = computed(() => {
    const tasks = this.taskService.tasks();
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === TaskStatus.DONE).length;
    return Math.round((completed / tasks.length) * 100);
  });

  @HostListener('window:keydown.n', ['$event'])
  handleKeyDown(event: unknown) {
    const kbEvent = event as KeyboardEvent;
    if (kbEvent.target instanceof HTMLInputElement || kbEvent.target instanceof HTMLTextAreaElement) return;

    kbEvent.preventDefault();
    document.querySelector<HTMLInputElement>('#taskInput')?.focus();
  }

  ngOnInit() {
    if (this.auth.currentUser()) {
      this.taskService.loadTasks();
    }
  }

  drop(event: CdkDragDrop<ITask[]>) {
    const tasksArray = [...this.taskService.tasks()];

    moveItemInArray(tasksArray, event.previousIndex, event.currentIndex);

    this.taskService.tasks.set(tasksArray);

    const orderedIds = tasksArray.map(task => task.id);

    this.taskService.reorder(orderedIds).subscribe({
      next: () => {
        console.log('Task order persisted successfully! ✨');
      },
      error: (err) => {
        console.error('Failed to save task order:', err);
      }
    });
  }

  toggleDarkMode() {
    this.app.toggleTheme();
  }

  create() {
    if (!this.newTaskTitle.trim()) return;

    this.taskService.create(this.newTaskTitle, this.newTaskDescription, this.newTaskCategory).subscribe({
      next: () => {
        this.newTaskTitle = '';
        this.newTaskDescription = '';
        this.newTaskCategory = 'Work';
      },
      error: (err) => console.error(err)
    });
  }

  toggleStatus(task: ITask) {
    const newStatus = task.status === TaskStatus.DONE
      ? TaskStatus.TODO
      : TaskStatus.DONE;

    this.taskService.update(task.id, newStatus).subscribe();
  }

  delete(id: string) {
    if (this.auth.currentUser()?.role !== UserRole.OWNER) return;

    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.delete(id).subscribe();
    }
  }

  logout() {
    this.auth.logout();
  }
}