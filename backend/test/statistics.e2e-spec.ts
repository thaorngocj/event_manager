import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request, { Response } from 'supertest';
import { AppModule } from '../src/app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  role: string;
}

interface OverviewStatisticsResponse {
  totalEvents: number;
  totalRegistrations: number;
  totalStudents: number;
}

type EventsByCategoryMonthResponse = unknown[];

describe('StatisticsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let server: Parameters<typeof request>[0];

  jest.setTimeout(30000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    server = app.getHttpServer() as Parameters<typeof request>[0];

    dataSource = app.get<DataSource>(getDataSourceToken());

    await dataSource.synchronize(true);

    const hashed = await bcrypt.hash('pass', 10);

    // Seed admin
    await dataSource.query(
      `INSERT INTO "user" (email, password, username, role)
       VALUES ('admin@stat.com', $1, 'Admin', 'ADMIN')`,
      [hashed],
    );

    // Login admin
    const loginAdmin: Response = await request(server)
      .post('/auth/login')
      .send({
        email: 'admin@stat.com',
        password: 'pass',
      })
      .expect(200);

    const loginBody = loginAdmin.body as LoginResponse;

    adminToken = loginBody.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/statistics/overview (GET) - Overview Stats', async () => {
    const response: Response = await request(server)
      .get('/statistics/overview')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const body = response.body as OverviewStatisticsResponse;

    expect(body).toHaveProperty('totalEvents');
    expect(body).toHaveProperty('totalRegistrations');
    expect(body).toHaveProperty('totalStudents');
  });

  it('/statistics/events-by-category-month (GET) - Events Chart', async () => {
    const response: Response = await request(server)
      .get('/statistics/events-by-category-month?year=2026')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    const body = response.body as EventsByCategoryMonthResponse;

    expect(Array.isArray(body)).toBe(true);
  });
});
