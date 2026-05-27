import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from '../events/event.entity';
import { Registration } from '../registrations/registration.entity';
import { User } from '../users/user.entity';

@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(Event)
    private eventRepo: Repository<Event>,
    @InjectRepository(Registration)
    private registrationRepo: Repository<Registration>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async getOverview() {
    const totalEvents = await this.eventRepo.count();
    const totalStudents = await this.userRepo.count({
      where: { role: 'STUDENT' },
    });
    const totalRegistrations = await this.registrationRepo.count();
    const totalCheckins = await this.registrationRepo.count({
      where: { status: 'CHECKED_IN' },
    });

    return {
      totalEvents,
      totalStudents,
      totalRegistrations,
      totalCheckins,
      checkinRate:
        totalRegistrations > 0
          ? ((totalCheckins / totalRegistrations) * 100).toFixed(2)
          : 0,
    };
  }

  async getEventStats(eventId: number) {
    const event = await this.eventRepo.findOne({ where: { id: eventId } });
    const registrations = await this.registrationRepo.find({
      where: { eventId },
    });
    const checkedIn = registrations.filter(
      (r) => r.status === 'CHECKED_IN',
    ).length;

    return {
      event: event?.title,
      totalRegistered: registrations.length,
      checkedIn: checkedIn,
      notCheckedIn: registrations.length - checkedIn,
      checkinRate:
        registrations.length > 0
          ? ((checkedIn / registrations.length) * 100).toFixed(2)
          : 0,
    };
  }

  async getTopStudents(limit: number = 10) {
    const result = await this.registrationRepo
      .createQueryBuilder('r')
      .select('r.userId', 'userId')
      .addSelect('COUNT(r.id)', 'eventCount')
      .addSelect(
        'SUM(CASE WHEN r.status = :checked THEN 1 ELSE 0 END)',
        'checkedCount',
      )
      .groupBy('r.userId')
      .orderBy('eventCount', 'DESC')
      .limit(limit)
      .setParameter('checked', 'CHECKED_IN')
      .getRawMany();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return result;
  }

  async getEventsCountByCategoryAndMonth() {
    type EventStatsRaw = {
      year: string;
      month: string;
      category: string;
      count: string;
    };

    const result: EventStatsRaw[] = await this.eventRepo
      .createQueryBuilder('e')
      .select('EXTRACT(YEAR FROM e.startDate)', 'year')
      .addSelect('EXTRACT(MONTH FROM e.startDate)', 'month')
      .addSelect('e.eventCategory', 'category')
      .addSelect('COUNT(e.id)', 'count')
      .groupBy('EXTRACT(YEAR FROM e.startDate)')
      .addGroupBy('EXTRACT(MONTH FROM e.startDate)')
      .addGroupBy('e.eventCategory')
      .orderBy('year', 'ASC')
      .addOrderBy('month', 'ASC')
      .getRawMany();

    return result.map((r) => ({
      year: Number(r.year),
      month: Number(r.month),
      category: r.category,
      count: Number(r.count),
    }));
  }

  async getRegistrationsCountByCategory() {
    type RegistrationStatsRaw = {
      category: string;
      count: string;
    };

    const result: RegistrationStatsRaw[] = await this.registrationRepo
      .createQueryBuilder('r')
      .innerJoin('r.event', 'e')
      .select('e.eventCategory', 'category')
      .addSelect('COUNT(r.id)', 'count')
      .groupBy('e.eventCategory')
      .getRawMany();

    return result.map((r) => ({
      category: r.category,
      count: Number(r.count),
    }));
  }
}
