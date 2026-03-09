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
  DONE = 'DONE',
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
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  accessToken: string;
  user: IUser;
}
