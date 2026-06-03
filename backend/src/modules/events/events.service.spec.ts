import { Test, TestingModule } from '@nestjs/testing';
import { EventsService } from './events.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { ImportHistory } from './history.event.entity';
import { Registration } from '../registrations/registration.entity';
import { User } from '../users/user.entity';
import { ActivityLogsService } from '../activity-logs/activity-logs.service';

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getRepositoryToken(Event),
          useValue: {},
        },
        {
          provide: getRepositoryToken(ImportHistory),
          useValue: {},
        },
        {
          provide: getRepositoryToken(Registration),
          useValue: {},
        },
        {
          provide: getRepositoryToken(User),
          useValue: {},
        },
        {
          provide: ActivityLogsService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
