import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticsService } from './statistics.service';
import { StatisticsController } from './statistics.controller';
import { Event } from '../events/event.entity';
import { Registration } from '../registrations/registration.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Event, Registration, User])],
  providers: [StatisticsService],
  controllers: [StatisticsController],
})
export class StatisticsModule {}
