export enum UserRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  VIEWER = 'VIEWER',
}

export interface IOrganization {
  id: string;
  name: string;
  type: 'CORPORATE' | 'DEPARTMENT';
  parentId?: string | null;
  children?: IOrganization[];
}

export interface IUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  organizationId: string;
  organization?: IOrganization;
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
  ARCHIVED = 'ARCHIVED',
}

export interface IComment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author?: IUser;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISubtask {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface ITask {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  category?: string;
  assigneeId?: string;
  assignee?: IUser;
  organizationId: string;
  dueDate?: Date;           
  subtasks?: ISubtask[];    
  comments?: IComment[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  user: IUser;
}