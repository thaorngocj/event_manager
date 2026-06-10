import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Faculty } from '../faculties/faculty.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column({ type: 'varchar', length: 50, nullable: true, unique: true })
  mssv?: string | null;

  @Column({ default: 'STUDENT' })
  role!: 'STUDENT' | 'EVENT_MANAGER' | 'ADMIN' | 'SUPER_ADMIN';

  @Column({ nullable: true })
  facultyId?: number;

  @ManyToOne(() => Faculty, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'facultyId' })
  faculty?: Faculty;

  @Column({ type: 'varchar', length: 100, nullable: true })
  major?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  cohort?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  classId?: string;

  @Column({ type: 'int', default: 0 })
  trainingPoints!: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  unionRole?: string;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'varchar', nullable: true })
  resetPasswordToken?: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  resetPasswordExpires?: Date | null;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2')) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  }
}
