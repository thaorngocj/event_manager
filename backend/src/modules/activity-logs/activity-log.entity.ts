import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'varchar', length: 100 })
  action!: string; // e.g., 'CREATE_EVENT', 'APPROVE_REGISTRATION'

  @Column({ type: 'varchar', length: 50, nullable: true })
  targetType?: string; // e.g., 'Event', 'Registration', 'User'

  @Column({ type: 'varchar', length: 100, nullable: true })
  targetId?: string; // ID of the affected entity

  @Column({ type: 'jsonb', nullable: true })
  details?: Record<string, any>; // Additional details about the action

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
