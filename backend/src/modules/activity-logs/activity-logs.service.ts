import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from './activity-log.entity';

@Injectable()
export class ActivityLogsService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepo: Repository<ActivityLog>,
  ) {}

  async logAction(
    userId: number,
    action: string,
    targetType?: string,
    targetId?: string,
    details?: Record<string, any>,
  ): Promise<ActivityLog> {
    const log = this.activityLogRepo.create({
      userId,
      action,
      targetType,
      targetId,
      details,
    });
    return this.activityLogRepo.save(log);
  }

  async getRecentActivities(limit: number = 10): Promise<ActivityLog[]> {
    return this.activityLogRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
