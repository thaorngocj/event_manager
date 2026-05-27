import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

describe('EventsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let eventId: string;

  jest.setTimeout(30000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    dataSource = app.get<DataSource>(getDataSourceToken());
    await dataSource.synchronize(true);

    const hashed = await bcrypt.hash('adminpass', 10);
    await dataSource.query(
      `INSERT INTO "user" (email, password, username, role) VALUES ('admin@test.com', $1, 'Admin Test', 'ADMIN')`,
      [hashed],
    );

    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'adminpass' })
      .expect(200);

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('/api/v1/events (POST) - Create Event', async () => {
    const response = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'E2E Test Event',
        description: 'Testing event creation',
        location: 'Hall A',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 86400000).toISOString(),
        eventCategory: 'ACADEMIC',
      })
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body.title).toBe('E2E Test Event');
    eventId = response.body.id;
  });

  it('/api/v1/events (GET) - List Events', async () => {
    const response = await request(app.getHttpServer())
      .get('/events')
      .expect(200);

    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0].title).toBe('E2E Test Event');
  });

  it('/api/v1/events/:id (GET) - Get Event', async () => {
    const response = await request(app.getHttpServer())
      .get(`/events/${eventId}`)
      .expect(200);

    expect(response.body.id).toBe(eventId);
    expect(response.body.title).toBe('E2E Test Event');
  });

  it('/api/v1/events/:id (PATCH) - Update Event', async () => {
    const response = await request(app.getHttpServer())
      .patch(`/events/${eventId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Updated E2E Test Event',
      })
      .expect(200);

    expect(response.body.title).toBe('Updated E2E Test Event');
  });

  it('/api/v1/events/:id (DELETE) - Delete Event', async () => {
    await request(app.getHttpServer())
      .delete(`/events/${eventId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Verify it's deleted
    await request(app.getHttpServer())
      .get(`/events/${eventId}`)
      .expect(404);
  });
});
