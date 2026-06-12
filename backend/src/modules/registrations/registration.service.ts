import { toDataURL } from 'qrcode';
import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Registration } from './registration.entity';
import { Event } from '../events/event.entity';
import { EVENT_STATUS } from '../../constants/event.constants';
import { User } from '../users/user.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class RegistrationService {
  constructor(
    @InjectRepository(Registration)
    private repo: Repository<Registration>,
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private mailService: MailService,
  ) {}

  async register(userId: number, eventId: number) {
    // Sử dụng Transaction và Pessimistic Locking để chống Race Condition (Overbooking)
    return await this.eventRepo.manager.transaction(async (manager) => {
      // 1. Khoá dòng dữ liệu của sự kiện này (Row-level lock)
      // Bất kỳ ai click đăng ký cùng lúc sẽ phải xếp hàng chờ request này chạy xong
      const event = await manager.findOne(Event, {
        where: { id: eventId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!event) throw new NotFoundException('Event không tồn tại');
      if (event.isCancelled) throw new BadRequestException('Sự kiện đã bị huỷ');

      const deadline = event.registrationDeadline
        ? new Date(event.registrationDeadline)
        : new Date(event.startDate);
      if (new Date() > deadline)
        throw new BadRequestException('Đã quá hạn đăng ký');

      if (
        event.status === EVENT_STATUS.CLOSED ||
        event.status === EVENT_STATUS.CANCELLED
      ) {
        throw new BadRequestException('Sự kiện đã đóng');
      }
      if (!event.isRegistrationOpen)
        throw new BadRequestException('Đăng ký đã bị tắt');

      // 2. Kiểm tra slot ngay trong lúc đang giữ Lock
      if (
        event.isFull ||
        (event.maxParticipants &&
          event.registeredCount >= event.maxParticipants)
      ) {
        throw new BadRequestException('Sự kiện đã đủ người');
      }

      const existing = await manager.findOne(Registration, {
        where: { userId, eventId },
      });
      if (existing) throw new ConflictException('Đã đăng ký rồi');

      // 3. Đăng ký và tăng số lượng
      const registration = manager.create(Registration, {
        userId,
        eventId,
        status: 'REGISTERED',
      });
      const savedRegistration = await manager.save(registration);

      event.registeredCount += 1;
      await manager.save(event);

      // Tạo QR code với ID THẬT từ database
      const qrData = JSON.stringify({
        userId,
        eventId,
        registrationId: savedRegistration.id,
      });

      const qrCode = await toDataURL(qrData);

      savedRegistration.qrCode = qrCode;
      const finalRegistration = await manager.save(savedRegistration);

      // Gửi email thông báo (chạy ngầm, không cần đợi trong transaction)
      void this.userRepo.findOne({ where: { id: userId } }).then((user) => {
        if (user && user.email) {
          this.mailService
            .sendEventRegistrationNotification(user.email, event.title, qrCode)
            .catch(console.error);
        }
      });

      return {
        message: 'Đăng ký thành công',
        registration: finalRegistration,
      };
    });
  }

  async checkIn(
    eventId: number,
    qrData: string,
    checkedBy: number,
  ): Promise<Registration> {
    let userId: number;
    let registrationId: number;

    try {
      const parsed = JSON.parse(qrData) as {
        userId: number;
        registrationId: number;
      };
      userId = parsed.userId;
      registrationId = parsed.registrationId;
    } catch {
      throw new BadRequestException('QR code không hợp lệ');
    }

    const registration = await this.repo.findOne({
      where: {
        id: registrationId,
        eventId,
        userId,
      },
      relations: ['event'],
    });

    if (!registration) throw new NotFoundException('Đăng ký không hợp lệ');
    if (registration.event.status === EVENT_STATUS.CANCELLED) {
      throw new BadRequestException('Sự kiện đã bị hủy');
    }
    if (registration.event.status === EVENT_STATUS.DRAFT) {
      throw new BadRequestException('Sự kiện đang là bản nháp');
    }
    if (registration.event.status === EVENT_STATUS.CLOSED) {
      throw new BadRequestException('Sự kiện đã kết thúc, không thể điểm danh');
    }

    const now = new Date();
    const checkinStartTime = new Date(registration.event.startDate);
    checkinStartTime.setMinutes(checkinStartTime.getMinutes() - 15);

    if (now < checkinStartTime) {
      throw new BadRequestException(
        'Chỉ được điểm danh sớm nhất 15 phút trước khi sự kiện bắt đầu',
      );
    }
    if (registration.status === 'CHECKED_IN')
      throw new BadRequestException('Đã check-in rồi');

    registration.status = 'CHECKED_IN';
    registration.checkedInAt = new Date();
    registration.checkedBy = checkedBy;

    return this.repo.save(registration);
  }

  async getUserRegistrations(userId: number) {
    const registrations = await this.repo.find({
      where: { userId },
      relations: ['event'],
      order: { registeredAt: 'DESC' },
    });

    return registrations.map((reg) => ({
      id: reg.id,
      eventId: reg.eventId,
      userId: reg.userId,
      eventTitle: reg.event?.title,
      eventDate: reg.event?.startDate,
      status: reg.status,
      registeredAt: reg.registeredAt,
      checkedInAt: reg.checkedInAt,
      qrCode: reg.qrCode,
    }));
  }

  async cancelRegistration(registrationId: number, userId: number) {
    const registration = await this.repo.findOne({
      where: { id: registrationId, userId },
      relations: ['event'],
    });

    if (!registration) {
      throw new NotFoundException('Không tìm thấy đăng ký');
    }

    const eventStartDate = new Date(registration.event.startDate);
    const now = new Date();

    if (now >= eventStartDate) {
      throw new BadRequestException('Không thể hủy sau khi sự kiện đã bắt đầu');
    }

    if (registration.status === 'CHECKED_IN') {
      throw new BadRequestException('Không thể hủy vì đã check-in');
    }

    registration.status = 'CANCELLED';

    await this.eventRepo.decrement(
      { id: registration.eventId },
      'registeredCount',
      1,
    );

    return this.repo.save(registration);
  }

  async manualCheckIn(eventId: number, email: string, checkedBy: number) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new NotFoundException('Không tìm thấy sinh viên');

    const registration = await this.repo.findOne({
      where: { userId: user.id, eventId },
      relations: ['event'],
    });
    if (!registration) throw new NotFoundException('Sinh viên chưa đăng ký');
    if (registration.event.status === EVENT_STATUS.CANCELLED) {
      throw new BadRequestException('Sự kiện đã bị hủy');
    }
    if (registration.event.status === EVENT_STATUS.DRAFT) {
      throw new BadRequestException('Sự kiện đang là bản nháp');
    }

    const now = new Date();
    const checkinStartTime = new Date(registration.event.startDate);
    checkinStartTime.setMinutes(checkinStartTime.getMinutes() - 15);

    if (now < checkinStartTime) {
      throw new BadRequestException(
        'Chỉ được điểm danh sớm nhất 15 phút trước khi sự kiện bắt đầu',
      );
    }
    if (registration.status === 'CHECKED_IN')
      throw new BadRequestException('Đã check-in rồi');

    registration.status = 'CHECKED_IN';
    registration.checkedInAt = new Date();
    registration.checkedBy = checkedBy;

    return this.repo.save(registration);
  }
}
