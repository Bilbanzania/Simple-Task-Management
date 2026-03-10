import { Component, inject, OnInit, computed, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import {
  DragDropModule,
  CdkDragDrop,
  moveItemInArray
} from '@angular/cdk/drag-drop';
import { TaskService } from '../core/task.service';
import { AuthService } from '../core/auth.service';
import { UsersService } from '../core/users.service';
import { AppComponent } from '../app.component';
import { UserRole, TaskStatus, ITask, ISubtask } from '@Simple Task Management/data';

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
  usersService = inject(UsersService);
  app = inject(AppComponent);

  newTaskTitle = '';
  newTaskDescription = '';
  newTaskCategory = 'Work';
  newTaskAssigneeId = '';
  newTaskDueDate: string | null = null;
  newTaskSubtasks: ISubtask[] = [];
  newSubtaskTitle = '';

  isDarkMode = this.app.isDarkMode;

  showForm = signal(false);
  activeTaskForSheet = signal<ITask | null>(null);

  editingTask = signal<ITask | null>(null);
  editTitle = '';
  editDescription = '';
  editCategory = '';
  editAssigneeId = '';
  editDueDate: string | null = null;
  editSubtasks: ISubtask[] = [];
  editNewSubtaskTitle = '';

  readonly columns = [
    { label: 'To Do', status: TaskStatus.TODO, color: 'text-slate-400' },
    { label: 'In Progress', status: TaskStatus.IN_PROGRESS, color: 'text-cyan-500' },
    { label: 'In Review', status: TaskStatus.IN_REVIEW, color: 'text-violet-500' },
    { label: 'Done', status: TaskStatus.DONE, color: 'text-teal-400' },
  ];

  groupedTasks = computed<Record<TaskStatus, ITask[]>>(() => {
    const tasks = this.taskService.tasks();
    const initial = Object.values(TaskStatus).reduce((acc, status) => {
      acc[status as TaskStatus] = [];
      return acc;
    }, {} as Record<TaskStatus, ITask[]>);

    return tasks.reduce((acc, task) => {
      if (acc[task.status]) acc[task.status].push(task);
      return acc;
    }, initial);
  });

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
    if (!this.showForm()) this.toggleForm();
    setTimeout(() => document.querySelector<HTMLInputElement>('#newTitle')?.focus(), 100);
  }

  ngOnInit() {
    if (this.auth.currentUser()) {
      this.taskService.loadTasks();
      this.usersService.loadUsers();
    }
  }

  toggleForm() { this.showForm.set(!this.showForm()); }
  openActionSheet(task: ITask) { this.activeTaskForSheet.set(task); }
  closeActionSheet() { this.activeTaskForSheet.set(null); }
  toggleDarkMode() { this.app.toggleTheme(); }

  addSubtaskToNewTask() {
    if (this.newSubtaskTitle.trim()) {
      this.newTaskSubtasks.push({ id: crypto.randomUUID(), title: this.newSubtaskTitle.trim(), isCompleted: false });
      this.newSubtaskTitle = '';
    }
  }
  removeNewSubtask(index: number) { this.newTaskSubtasks.splice(index, 1); }

  addSubtaskToEdit() {
    if (this.editNewSubtaskTitle.trim()) {
      this.editSubtasks.push({ id: crypto.randomUUID(), title: this.editNewSubtaskTitle.trim(), isCompleted: false });
      this.editNewSubtaskTitle = '';
    }
  }
  removeEditSubtask(index: number) { this.editSubtasks.splice(index, 1); }

  toggleSubtaskCompletion(task: ITask, subtaskId: string) {
    if (!this.canEdit()) return;
    const updatedSubtasks = task.subtasks?.map(st => st.id === subtaskId ? { ...st, isCompleted: !st.isCompleted } : st) || [];
    this.taskService.update(task.id, { subtasks: updatedSubtasks }).subscribe(() => this.taskService.loadTasks());
  }

  getCompletedSubtasksCount(task: ITask): number {
    return task.subtasks?.filter(s => s.isCompleted).length || 0;
  }

  openEditModal(task: ITask) {
    this.editingTask.set(task);
    this.editTitle = task.title;
    this.editDescription = task.description || '';
    this.editCategory = task.category || 'Work';
    this.editAssigneeId = task.assigneeId || task.assignee?.id || '';
    this.editDueDate = task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : null; 
    this.editSubtasks = task.subtasks ? JSON.parse(JSON.stringify(task.subtasks)) : []; 
  }

  closeEditModal() {
    this.editingTask.set(null);
  }

  saveEdit() {
    const task = this.editingTask();
    if (!task || !this.editTitle.trim()) return;

    const updates: Partial<ITask> = {
      title: this.editTitle,
      description: this.editDescription,
      category: this.editCategory,
      assigneeId: this.editAssigneeId || undefined,
      dueDate: this.editDueDate ? new Date(this.editDueDate) : undefined,
      subtasks: this.editSubtasks
    };

    this.taskService.update(task.id, updates).subscribe(() => {
      this.closeEditModal();
      this.taskService.loadTasks();
    });
  }

  moveTaskFromSheet(newStatus: TaskStatus) {
    const task = this.activeTaskForSheet();
    if (!task) return;

    const updatedTasks = this.taskService.tasks().map(t =>
      t.id === task.id ? { ...t, status: newStatus } : t
    );
    this.taskService.tasks.set(updatedTasks);
    this.taskService.update(task.id, { status: newStatus }).subscribe();
    this.closeActionSheet();
  }

  drop(event: CdkDragDrop<ITask[]>) {
    if (event.previousContainer === event.container) {
      const tasksArray = [...this.taskService.tasks()];
      moveItemInArray(tasksArray, event.previousIndex, event.currentIndex);
      this.taskService.tasks.set(tasksArray);
      const orderedIds = tasksArray.map(task => task.id);
      this.taskService.reorder(orderedIds).subscribe();
    } else {
      const task = event.item.data as ITask;
      const newStatus = event.container.id as TaskStatus;
      const updatedTasks = this.taskService.tasks().map(t =>
        t.id === task.id ? { ...t, status: newStatus } : t
      );
      this.taskService.tasks.set(updatedTasks);
      this.taskService.update(task.id, { status: newStatus }).subscribe();
    }
  }

  create() {
    if (!this.newTaskTitle.trim()) return;

    const dueDateObj = this.newTaskDueDate ? new Date(this.newTaskDueDate) : null;

    this.taskService.create(this.newTaskTitle, this.newTaskDescription, this.newTaskCategory, this.newTaskAssigneeId, dueDateObj, this.newTaskSubtasks).subscribe({
      next: () => {
        this.newTaskTitle = '';
        this.newTaskDescription = '';
        this.newTaskCategory = 'Work';
        this.newTaskAssigneeId = ''; 
        this.newTaskDueDate = null;
        this.newTaskSubtasks = [];
        this.showForm.set(false);
      },
      error: (err) => console.error(err)
    });
  }

  delete(id: string) {
    if (this.auth.currentUser()?.role !== UserRole.OWNER) return;
    if (confirm('Are you sure you want to delete this task?')) {
      this.taskService.delete(id).subscribe();
      this.closeActionSheet();
    }
  }

  logout() { this.auth.logout(); }
}