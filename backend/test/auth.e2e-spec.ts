import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  jest.setTimeout(30000); // 30 seconds timeout for E2E tests

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get<DataSource>(getDataSourceToken());

    // Clear database before tests
    await dataSource.synchronize(true);

    // Seed admin user
    const hashed = await bcrypt.hash('adminpass', 10);
    await dataSource.query(
      `INSERT INTO "user" (email, password, username, role) VALUES ('admin@test.com', $1, 'Admin Test', 'ADMIN')`,
      [hashed],
    );
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/api/v1/auth/login (POST) - Success', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login') // Note: app.setGlobalPrefix('api/v1') might not be applied in Test app unless explicitly set, let's assume raw paths unless prefix is in controller. The controller route is 'auth'. Wait, if global prefix is used in main.ts, it's not here. So it's just /auth/login.
      .send({
        email: 'admin@test.com',
        password: 'adminpass',
      })
      .expect(200);

    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('refreshToken');
    expect(response.body.role).toBe('ADMIN');
  });

  it('/api/v1/auth/login (POST) - Invalid Password', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'wrongpassword',
      })
      .expect(401);

    expect(response.body.message).toBe('Invalid password');
  });

  it('/api/v1/auth/refresh (POST) - Success', async () => {
    // 1. Login first to get refresh token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'adminpass',
      })
      .expect(200);

    const refreshToken = loginResponse.body.refreshToken;

    // 2. Use refresh token
    const refreshResponse = await request(app.getHttpServer())
      .post('/auth/refresh')
      .send({
        refreshToken: refreshToken,
      })
      .expect(200);

    expect(refreshResponse.body).toHaveProperty('accessToken');
    expect(refreshResponse.body).toHaveProperty('refreshToken');
  });
});
