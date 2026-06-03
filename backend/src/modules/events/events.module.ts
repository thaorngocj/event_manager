import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { Event } from './event.entity';
import { ImportHistory } from './history.event.entity';
import { Registration } from '../registrations/registration.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event, ImportHistory, Registration, User]),
    ScheduleModule.forRoot(),
  ],
  providers: [EventsService],
  controllers: [EventsController],
  exports: [EventsService],
})
export class EventsModule {}
