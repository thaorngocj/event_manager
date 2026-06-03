import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Event } from '../events/event.entity';

@Entity()
export class Registration {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: number;

  @ManyToOne(() => Event)
  @JoinColumn({ name: 'eventId' })
  event!: Event;

  @Column()
  eventId!: number;

  @Column({ default: 'REGISTERED' })
  status!: 'REGISTERED' | 'CHECKED_IN' | 'CANCELLED';

  @Column({ nullable: true })
  qrCode!: string;

  @Column({ nullable: true })
  checkedInAt!: Date;

  @Column({ nullable: true })
  // ID của người check-in (admin/event manager)
  checkedBy!: number;

  @CreateDateColumn()
  registeredAt!: Date;
}
