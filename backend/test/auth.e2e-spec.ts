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

interface ErrorResponse {
  message: string;
}

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  jest.setTimeout(30000);

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
      `INSERT INTO "user" (email, password, username, role)
       VALUES ('admin@test.com', $1, 'Admin Test', 'ADMIN')`,
      [hashed],
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('/auth/login (POST) - Success', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    const response: Response = await request(server)
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'adminpass',
      })
      .expect(200);

    const body = response.body as LoginResponse;

    expect(body).toHaveProperty('accessToken');
    expect(body).toHaveProperty('refreshToken');
    expect(body.role).toBe('ADMIN');
  });

  it('/auth/login (POST) - Invalid Password', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    const response: Response = await request(server)
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'wrongpassword',
      })
      .expect(401);

    const body = response.body as ErrorResponse;

    expect(body.message).toBe('Invalid password');
  });

  it('/auth/refresh (POST) - Success', async () => {
    const server = app.getHttpServer() as Parameters<typeof request>[0];

    // 1. Login first to get refresh token
    const loginResponse: Response = await request(server)
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'adminpass',
      })
      .expect(200);

    const loginBody = loginResponse.body as LoginResponse;

    const refreshToken: string = loginBody.refreshToken;

    // 2. Use refresh token
    const refreshResponse: Response = await request(server)
      .post('/auth/refresh')
      .send({
        refreshToken,
      })
      .expect(200);

    const refreshBody = refreshResponse.body as LoginResponse;

    expect(refreshBody).toHaveProperty('accessToken');
    expect(refreshBody).toHaveProperty('refreshToken');
  });
});
