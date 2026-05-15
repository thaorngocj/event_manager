import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  EVENT_STATUS,
  EVENT_CATEGORY,
  DISPLAY_CATEGORY,
  SCALE,
} from '../../constants/event.constants';
import type {
  DisplayCategory,
  EventCategory,
  Scale,
  EventStatus,
} from '../../constants/event.constants';
@Entity('events')
@Index(['startDate', 'endDate']) // index cho calendar query
@Index(['eventCategory']) // index cho filter
@Index(['status']) // index cho cron update
export class Event {
  @PrimaryGeneratedColumn()
  id!: number;

  // Thông tin cơ bản
  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ length: 500 })
  location!: string;

  // Thời gian
  @Column({ type: 'timestamptz' }) // timestamptz = có timezone
  startDate!: Date;

  @Column({ type: 'timestamptz' })
  endDate!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  registrationDeadline?: Date | null; // Hạn đăng ký (≤ startDate)

  // Trạng thái
  @Column({
    type: 'varchar',
    default: EVENT_STATUS.UPCOMING,
  })
  status!: EventStatus;

  @Column({ default: false })
  isCancelled!: boolean; // Soft cancel, giữ data

  // Phân loại
  @Column({
    type: 'varchar',
    default: DISPLAY_CATEGORY.NORMAL,
  })
  displayCategory!: DisplayCategory;

  @Column({
    type: 'varchar',
    default: EVENT_CATEGORY.ACADEMIC,
  })
  eventCategory!: EventCategory;

  @Column({ type: 'varchar', default: SCALE.SCHOOL })
  scale!: Scale;

  // Đơn vị tổ chức
  @Column({ length: 255, nullable: true })
  faculty?: string; // Khoa tổ chức

  @Column({ length: 255, nullable: true })
  organizer?: string; // Tên đơn vị/CLB/Đoàn-Hội

  @Column({ length: 100, nullable: true })
  contactEmail?: string;

  @Column({ length: 20, nullable: true })
  contactPhone?: string;

  // Người tham dự

  @Column({ type: 'int', nullable: true })
  maxParticipants?: number; // null = không giới hạn

  @Column({ type: 'int', default: 0 })
  registeredCount!: number; // Cache count, sync qua trigger/service

  // IMG

  @Column({ type: 'text', nullable: true })
  imageUrl?: string;

  @Column({ type: 'text', nullable: true })
  bannerUrl?: string; // Ảnh banner lớn cho HERO

  // Tags & SEO
  @Column({ type: 'simple-array', nullable: true })
  tags?: string[]; // ['BMC', 'khởi nghiệp', 'sinh viên']

  // Audit
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @Column({ type: 'int', nullable: true })
  createdBy?: number; // userId của admin tạo event

  // Computed helper (không lưu DB)
  get isRegistrationOpen(): boolean {
    const now = new Date();
    const deadline = this.registrationDeadline ?? this.startDate;

    return (
      (this.status === EVENT_STATUS.UPCOMING ||
        this.status === EVENT_STATUS.OPEN) &&
      !this.isCancelled &&
      now < deadline &&
      (this.maxParticipants == null ||
        this.registeredCount < this.maxParticipants)
    );
  }

  get isFull(): boolean {
    return (
      this.maxParticipants != null &&
      this.registeredCount >= this.maxParticipants
    );
  }
}
