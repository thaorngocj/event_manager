import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

describe('StatisticsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;

  jest.setTimeout(30000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get<DataSource>(getDataSourceToken());
    await dataSource.synchronize(true);

    const hashed = await bcrypt.hash('pass', 10);
    // Seed admin
    await dataSource.query(
      `INSERT INTO "user" (email, password, username, role) VALUES ('admin@stat.com', $1, 'Admin', 'ADMIN')`,
      [hashed],
    );

    // Get tokens
    const loginAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@stat.com', password: 'pass' });
    adminToken = loginAdmin.body.accessToken;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('/api/v1/statistics/overview (GET) - Overview Stats', async () => {
    const response = await request(app.getHttpServer())
      .get('/statistics/overview')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(response.body).toHaveProperty('totalEvents');
    expect(response.body).toHaveProperty('totalRegistrations');
    expect(response.body).toHaveProperty('totalStudents');
  });

  it('/api/v1/statistics/events-by-category-month (GET) - Events Chart', async () => {
    const response = await request(app.getHttpServer())
      .get('/statistics/events-by-category-month?year=2026')
      .set('Authorization', `Bearer ${adminToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });
});
