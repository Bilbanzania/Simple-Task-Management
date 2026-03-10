import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ITask, TaskStatus, ISubtask } from '@Simple Task Management/data';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { Comment } from './comment.entity';

@Entity()
export class Task implements ITask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'simple-enum',
    enum: TaskStatus,
    default: TaskStatus.TODO
  })
  status: TaskStatus;

  @Column({ default: 'Work' })
  category: string;

  @Column({ default: 0 })
  position: number;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ type: 'simple-json', nullable: true, default: [] })
  subtasks: ISubtask[];

  @OneToMany(() => Comment, (comment) => comment.task)
  comments: Comment[];

  @ManyToOne(() => Organization, (org) => org.tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organizationId' })
  organization: Organization;

  @Column()
  organizationId: string;

  @ManyToOne(() => User, (user) => user.tasks, { nullable: true })
  @JoinColumn({ name: 'assigneeId' })
  assignee: User;

  @Column({ nullable: true })
  assigneeId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}