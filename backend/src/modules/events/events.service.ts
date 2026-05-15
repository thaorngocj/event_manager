/* eslint-disable */
import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import { Event } from './event.entity';
import { ImportHistory } from './history.event.entity';
import { Registration } from '../registrations/registration.entity';
import { User } from '../users/user.entity';
import { CalendarQueryDto } from './dto/calendar-query.dto';
import * as XLSX from 'xlsx';
import {
  EVENT_CATEGORY_COLORS,
  EVENT_STATUS,
} from '../../constants/event.constants';
import { UpdateEventDto } from './dto/update-event.dto'; // thêm dòng này

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private repo: Repository<Event>,
    @InjectRepository(ImportHistory)
    private importHistoryRepo: Repository<ImportHistory>,
    @InjectRepository(Registration)
    private registrationRepo: Repository<Registration>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  // CRON: Tự động cập nhật status
  /**
   * Chạy mỗi 15 phút
   * UPCOMING  → ONGOING  khi đến giờ bắt đầu
   * ONGOING   → CLOSED   khi hết giờ
   * UPCOMING  → CLOSED   nếu bị bỏ qua (server downtime)
   */
  @Cron('0 */15 * * * *', { name: 'auto-update-event-status' })
  async autoUpdateEventStatus() {
    const now = new Date();

    // UPCOMING/OPEN → ONGOING (đã đến giờ bắt đầu, chưa kết thúc)
    await this.repo
      .createQueryBuilder()
      .update(Event)
      .set({ status: EVENT_STATUS.ONGOING })
      .where(
        'startDate <= :now AND endDate > :now AND status IN (:...statuses) AND isCancelled = false',
        { now, statuses: [EVENT_STATUS.UPCOMING, EVENT_STATUS.OPEN] },
      )
      .execute();

    // UPCOMING/OPEN/ONGOING → CLOSED (đã hết giờ)
    await this.repo
      .createQueryBuilder()
      .update(Event)
      .set({ status: EVENT_STATUS.CLOSED })
      .where(
        'endDate <= :now AND status NOT IN (:...statuses) AND isCancelled = false',
        {
          now,
          statuses: [
            EVENT_STATUS.CLOSED,
            EVENT_STATUS.CANCELLED,
            EVENT_STATUS.DRAFT,
          ],
        },
      )
      .execute();
  }

  // CRUD
  create(data: Partial<Event>) {
    if (!data.startDate || !data.endDate) {
      throw new BadRequestException('Thiếu startDate hoặc endDate');
    }

    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestException('Ngày không hợp lệ');
    }

    if (startDate >= endDate) {
      throw new BadRequestException('startDate phải trước endDate');
    }

    let registrationDeadline: Date | null = null;

    if (data.registrationDeadline) {
      const parsed = new Date(data.registrationDeadline);

      if (isNaN(parsed.getTime())) {
        throw new BadRequestException('registrationDeadline không hợp lệ');
      }

      if (parsed > startDate) {
        throw new BadRequestException(
          'registrationDeadline phải trước startDate',
        );
      }

      registrationDeadline = parsed;
    }

    const event = this.repo.create({
      ...data,
      startDate,
      endDate,
      registrationDeadline,
      displayCategory: data.displayCategory ?? ('NORMAL' as any),
      eventCategory: data.eventCategory ?? ('ACADEMIC' as any),
      scale: data.scale ?? ('SCHOOL' as any),
      status: data.status ?? EVENT_STATUS.UPCOMING,
    });

    return this.repo.save(event);
  }

  async findAll(page = 1, limit = 20, status?: string, category?: string, faculty?: string) {
    const where: Record<string, any> = {};
    if (status) where.status = status;
    if (category) where.eventCategory = category;
    if (faculty) where.faculty = faculty;

    const [data, total] = await this.repo.findAndCount({
      where: Object.keys(where).length ? where : undefined,
      order: { startDate: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const event = await this.repo.findOne({ where: { id } });
    if (!event) throw new NotFoundException('Event not found');
    return event;
  }

  async update(id: number, data: UpdateEventDto) {
    const existing = await this.findOne(id);

    const start = data.startDate
      ? new Date(data.startDate)
      : existing.startDate;

    const end = data.endDate ? new Date(data.endDate) : existing.endDate;

    const deadline = data.registrationDeadline
      ? new Date(data.registrationDeadline)
      : existing.registrationDeadline;

    if (start >= end)
      throw new BadRequestException('startDate phải trước endDate');

    if (deadline && deadline > start)
      throw new BadRequestException(
        'registrationDeadline phải trước startDate',
      );

    await this.repo.update(id, {
      ...data,
      startDate: start,
      endDate: end,
      registrationDeadline: deadline,
    });

    return this.findOne(id);
  }

  async remove(id: number) {
    await this.repo.delete(id);
    return { message: 'Deleted' };
  }

  // CALENDAR ENDPOINT
  /**
   * Trả về events theo tháng, format sẵn cho react-big-calendar / FullCalendar
   * Query: GET /events/calendar?year=2026&month=4&category=ACADEMIC
   */
  async getCalendarEvents(query: CalendarQueryDto) {
    const now = new Date();
    const year = query.year ?? now.getFullYear();
    const month = query.month ?? now.getMonth() + 1; // 1-based

    // Lấy toàn bộ tháng (thêm padding 1 tuần trước/sau cho lịch hiển thị đúng)
    const startOfView = new Date(year, month - 2, 24); // cuối tháng trước
    const endOfView = new Date(year, month, 7); // đầu tháng sau

    const qb = this.repo
      .createQueryBuilder('event')
      .where(
        // Lấy event có bất kỳ phần nào trong khoảng view
        'event.startDate < :endOfView AND event.endDate > :startOfView',
        { startOfView, endOfView },
      )
      .andWhere('event.status != :draft', { draft: EVENT_STATUS.DRAFT })
      .orderBy('event.startDate', 'ASC');

    if (query.category) {
      qb.andWhere('event.eventCategory = :category', {
        category: query.category,
      });
    }

    const events = await qb.getMany();

    return {
      year,
      month,
      // Metadata cho frontend render legend
      categoryColors: EVENT_CATEGORY_COLORS,
      events: events.map((e) => this.toCalendarItem(e)),
    };
  }

  /** Format 1 event thành shape mà react-big-calendar / FullCalendar hiểu */
  private toCalendarItem(e: Event) {
    return {
      id: e.id,
      title: e.title,
      start: e.startDate, // Date object / ISO string
      end: e.endDate,
      location: e.location,
      status: e.status,
      category: e.eventCategory,
      color: EVENT_CATEGORY_COLORS[e.eventCategory],
      displayCategory: e.displayCategory,
      organizer: e.organizer,
      faculty: e.faculty,
      imageUrl: e.imageUrl,
      maxParticipants: e.maxParticipants,
      registeredCount: e.registeredCount,
      isFull: e.isFull,
      isRegistrationOpen: e.isRegistrationOpen,
      registrationDeadline: e.registrationDeadline,
      tags: e.tags,
    };
  }

  // IMPORT / EXPORT (giữ nguyên từ code cũ, đã improve)
  async importParticipants(
    eventId: number,
    fileBuffer: Buffer,
    importedBy: number,
    fileName: string,
  ) {
    const event = await this.findOne(eventId);

    let data: any[] = [];
    try {
      const workbook = XLSX.read(fileBuffer);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      data = XLSX.utils.sheet_to_json(sheet);
    } catch {
      throw new BadRequestException('File Excel không đúng định dạng');
    }

    if (data.length === 0)
      throw new BadRequestException('File không có dữ liệu');

    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const email = row.email || row.Email;

      if (!email) {
        failedCount++;
        errors.push(`Dòng ${i + 2}: Thiếu email`);
        continue;
      }

      const user = await this.userRepo.findOne({ where: { email } });
      if (!user) {
        failedCount++;
        errors.push(`Dòng ${i + 2}: Email ${email} không tồn tại`);
        continue;
      }

      const existing = await this.registrationRepo.findOne({
        where: { userId: user.id, eventId },
      });
      if (existing) {
        failedCount++;
        errors.push(`Dòng ${i + 2}: ${email} đã đăng ký rồi`);
        continue;
      }

      const registration = this.registrationRepo.create({
        userId: user.id,
        eventId,
        status: 'CHECKED_IN',
        checkedInAt: new Date(),
        checkedBy: importedBy,
      });
      await this.registrationRepo.save(registration);

      // Cập nhật registeredCount
      await this.repo.increment({ id: eventId }, 'registeredCount', 1);

      successCount++;
    }

    const history = this.importHistoryRepo.create({
      eventId,
      importedBy,
      fileName,
      totalRows: data.length,
      successCount,
      failedCount,
      errors: errors.slice(0, 10).join('; '),
    });
    await this.importHistoryRepo.save(history);

    return {
      message: `Import hoàn tất: ${successCount} thành công, ${failedCount} thất bại`,
      eventId,
      eventTitle: event.title,
      successCount,
      failedCount,
      errors: errors.slice(0, 20),
    };
  }

  async getImportHistory(eventId: number) {
    const history = await this.importHistoryRepo.find({
      where: { eventId },
      relations: ['user'],
      order: { importedAt: 'DESC' },
    });
    return history.map((h) => ({
      id: h.id,
      fileName: h.fileName,
      importedBy: h.user?.username,
      importedAt: h.importedAt,
      totalRows: h.totalRows,
      successCount: h.successCount,
      failedCount: h.failedCount,
      errors: h.errors,
    }));
  }

  async exportParticipants(eventId: number) {
    const event = await this.findOne(eventId);

    const registrations = await this.registrationRepo.find({
      where: { eventId },
      relations: ['user'],
    });

    const data = registrations.map((reg, idx) => ({
      STT: idx + 1,
      'Họ tên': reg.user?.username || 'N/A',
      Email: reg.user?.email || 'N/A',
      'Trạng thái': reg.status === 'CHECKED_IN' ? 'Đã tham gia' : 'Đã đăng ký',
      'Thời gian đăng ký': reg.registeredAt,
      'Thời gian check-in': reg.checkedInAt || 'Chưa check-in',
      'Người check-in': reg.checkedBy || 'N/A',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Participants');
    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
  async getRegistrations(eventId: number) {
    await this.findOne(eventId); // kiểm tra event tồn tại

    const registrations = await this.registrationRepo.find({
      where: { eventId },
      relations: ['user'],
      order: { registeredAt: 'DESC' },
    });

    return registrations.map((reg) => ({
      id: reg.id,
      userId: reg.userId,
      username: reg.user?.username,
      email: reg.user?.email,
      status: reg.status,
      registeredAt: reg.registeredAt,
      checkedInAt: reg.checkedInAt ?? null,
    }));
  }
}
