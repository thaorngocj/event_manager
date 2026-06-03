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

interface EventResponse {
  id: string;
  title: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  eventCategory: string;
}

interface EventsListResponse {
  data: EventResponse[];
}

describe('EventsController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let accessToken: string;
  let eventId: string;
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

    const hashed = await bcrypt.hash('adminpass', 10);

    await dataSource.query(
      `INSERT INTO "user" (email, password, username, role)
       VALUES ('admin@test.com', $1, 'Admin Test', 'ADMIN')`,
      [hashed],
    );

    const loginResponse: Response = await request(server)
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'adminpass',
      })
      .expect(200);

    const loginBody = loginResponse.body as LoginResponse;

    accessToken = loginBody.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/events (POST) - Create Event', async () => {
    const response: Response = await request(server)
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

    const body = response.body as EventResponse;

    expect(body).toHaveProperty('id');
    expect(body.title).toBe('E2E Test Event');

    eventId = body.id;
  });

  it('/events (GET) - List Events', async () => {
    const response: Response = await request(server).get('/events').expect(200);

    const body = response.body as EventsListResponse;

    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0]?.title).toBe('E2E Test Event');
  });

  it('/events/:id (GET) - Get Event', async () => {
    const response: Response = await request(server)
      .get(`/events/${eventId}`)
      .expect(200);

    const body = response.body as EventResponse;

    expect(body.id).toBe(eventId);
    expect(body.title).toBe('E2E Test Event');
  });

  it('/events/:id (PATCH) - Update Event', async () => {
    const response: Response = await request(server)
      .patch(`/events/${eventId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'Updated E2E Test Event',
      })
      .expect(200);

    const body = response.body as EventResponse;

    expect(body.title).toBe('Updated E2E Test Event');
  });

  it('/events/:id (DELETE) - Delete Event', async () => {
    await request(server)
      .delete(`/events/${eventId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .expect(200);

    // Verify deleted
    await request(server).get(`/events/${eventId}`).expect(404);
  });
});
