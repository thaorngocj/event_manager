import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { User } from '../users/user.entity';

@Entity('import_history')
export class ImportHistory {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  eventId!: number;

  @ManyToOne(() => Event, { nullable: true })
  @JoinColumn({ name: 'eventId' })
  event!: Event;

  @Column()
  importedBy!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'importedBy' })
  user!: User;

  @Column()
  fileName!: string;

  @Column({ default: 0 })
  totalRows!: number;

  @Column({ default: 0 })
  successCount!: number;

  @Column({ default: 0 })
  failedCount!: number;

  @Column({ type: 'text', nullable: true })
  errors!: string;

  @CreateDateColumn()
  importedAt!: Date;
}
