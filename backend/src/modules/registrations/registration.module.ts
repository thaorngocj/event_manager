import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationService } from './registration.service';
import { RegistrationController } from './registration.controller';
import { Registration } from './registration.entity';
import { Event } from '../events/event.entity';
import { User } from '../users/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Registration, Event, User])],
  providers: [RegistrationService],
  controllers: [RegistrationController],
  exports: [RegistrationService],
})
export class RegistrationsModule {}
