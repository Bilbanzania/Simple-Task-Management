import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  resourceId: string;

  @Column('text', { nullable: true })
  details: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'actorId' }) 
  actor: User; 

  @Column({ type: 'uuid', nullable: true })
  actorId: string;

  @Column()
  organizationId: string;

  @CreateDateColumn()
  createdAt: Date;
}