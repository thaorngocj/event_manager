import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { User } from './modules/users/user.entity';
import { Event } from './modules/events/event.entity';
import { Registration } from './modules/registrations/registration.entity';
import { ImportHistory } from './modules/events/history.event.entity';
import { ActivityLog } from './modules/activity-logs/activity-log.entity';
import { Faculty } from './modules/faculties/faculty.entity';

import * as dotenv from 'dotenv';
dotenv.config();

// Dùng chung cho NestJS và TypeORM CLI
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: +(process.env.DB_PORT || 5432),
  username: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'postpass',
  database: process.env.POSTGRES_DB || 'mydb',
  entities: [User, Event, Registration, ImportHistory, ActivityLog, Faculty],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
  logging: true,
});
