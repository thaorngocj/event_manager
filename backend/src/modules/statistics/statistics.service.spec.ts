import { Test, TestingModule } from '@nestjs/testing';
import { StatisticsService } from './statistics.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from '../events/event.entity';
import { Registration } from '../registrations/registration.entity';
import { User } from '../users/user.entity';

describe('StatisticsService', () => {
  let service: StatisticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StatisticsService,
        {
          provide: getRepositoryToken(Event),
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
      ],
    }).compile();

    service = module.get<StatisticsService>(StatisticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
