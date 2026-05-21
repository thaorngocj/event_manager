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
    const event = await this.eventRepo.findOne({ where: { id: eventId } });

    if (!event) {
      throw new NotFoundException('Event không tồn tại');
    }

    if (event.isCancelled) {
      throw new BadRequestException('Sự kiện đã bị huỷ');
    }

    if (
      event.registrationDeadline &&
      new Date() > new Date(event.registrationDeadline)
    ) {
      throw new BadRequestException('Đã quá hạn đăng ký');
    }

    if (
      event.status === EVENT_STATUS.CLOSED ||
      event.status === EVENT_STATUS.CANCELLED
    ) {
      throw new BadRequestException('Sự kiện đã đóng');
    }

    if (!event.isRegistrationOpen) {
      throw new BadRequestException('Đăng ký đã bị tắt');
    }

    if (
      event.isFull ||
      (event.maxParticipants && event.registeredCount >= event.maxParticipants)
    ) {
      throw new BadRequestException('Sự kiện đã đủ người');
    }

    const existing = await this.repo.findOne({ where: { userId, eventId } });

    if (existing) {
      throw new ConflictException('Đã đăng ký rồi');
    }

    const registration = this.repo.create({
      userId,
      eventId,
      status: 'REGISTERED',
    });

    const savedRegistration = await this.repo.save(registration);
    await this.eventRepo.increment({ id: eventId }, 'registeredCount', 1);

    // Tạo QR code với ID THẬT từ database
    const qrData = JSON.stringify({
      userId,
      eventId,
      registrationId: savedRegistration.id, // Dùng ID thật
    });

    const qrCode = await toDataURL(qrData);

    // Cập nhật QR code vào registration
    savedRegistration.qrCode = qrCode;
    const finalRegistration = await this.repo.save(savedRegistration);

    // Gửi email thông báo (bất đồng bộ)
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (user && user.email) {
      this.mailService
        .sendEventRegistrationNotification(user.email, event.title, qrCode)
        .catch(console.error);
    }

    return finalRegistration;
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
    if (registration.event.status !== EVENT_STATUS.ONGOING) throw new BadRequestException('Sự kiện chưa diễn ra hoặc đã kết thúc');
    if (registration.status === 'CHECKED_IN') throw new BadRequestException('Đã check-in rồi');

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
    if (registration.event.status !== EVENT_STATUS.ONGOING) throw new BadRequestException('Sự kiện chưa diễn ra hoặc đã kết thúc');
    if (registration.status === 'CHECKED_IN') throw new BadRequestException('Đã check-in rồi');

    registration.status = 'CHECKED_IN';
    registration.checkedInAt = new Date();
    registration.checkedBy = checkedBy;

    return this.repo.save(registration);
  }
}
