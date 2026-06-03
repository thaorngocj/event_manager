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
  location: string;
  startDate: string;
  endDate: string;
  eventCategory: string;
  status: string;
}

interface RegistrationResponse {
  id: string;
  status: string;
  eventId: string;
}

describe('RegistrationController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let studentToken: string;
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

    const hashed = await bcrypt.hash('pass', 10);

    // Seed admin
    await dataSource.query(
      `INSERT INTO "user" (email, password, username, role)
       VALUES ('admin@reg.com', $1, 'Admin', 'ADMIN')`,
      [hashed],
    );

    // Seed student
    await dataSource.query(
      `INSERT INTO "user" (email, password, username, role)
       VALUES ('student@reg.com', $1, 'Student', 'STUDENT')`,
      [hashed],
    );

    // Admin login
    const loginAdmin: Response = await request(server)
      .post('/auth/login')
      .send({
        email: 'admin@reg.com',
        password: 'pass',
      })
      .expect(200);

    const adminBody = loginAdmin.body as LoginResponse;

    adminToken = adminBody.accessToken;

    // Student login
    const loginStudent: Response = await request(server)
      .post('/auth/login')
      .send({
        email: 'student@reg.com',
        password: 'pass',
      })
      .expect(200);

    const studentBody = loginStudent.body as LoginResponse;

    studentToken = studentBody.accessToken;

    // Create event
    const eventRes: Response = await request(server)
      .post('/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Reg Test Event',
        location: 'Hall A',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 172800000).toISOString(),
        eventCategory: 'ACADEMIC',
        status: 'UPCOMING',
      })
      .expect(201);

    const eventBody = eventRes.body as EventResponse;

    eventId = eventBody.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/registrations/events/:eventId/register (POST) - Register for event', async () => {
    const response: Response = await request(server)
      .post(`/registrations/events/${eventId}/register`)
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(201);

    const body = response.body as RegistrationResponse;

    expect(body).toHaveProperty('id');
    expect(body.status).toBe('REGISTERED');
  });

  it('/registrations/my-events (GET) - Get my registrations', async () => {
    const response: Response = await request(server)
      .get('/registrations/my-events')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    const body = response.body as RegistrationResponse[];

    expect(Array.isArray(body)).toBe(true);
    expect(body.length).toBe(1);
    expect(body[0]?.eventId).toBe(eventId);
  });

  it('/registrations/events/:eventId/manual-checkin (POST) - Check-in', async () => {
    // Update event to ONGOING
    await request(server)
      .patch(`/events/${eventId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        status: 'ONGOING',
      })
      .expect(200);

    const response: Response = await request(server)
      .post(`/registrations/events/${eventId}/manual-checkin`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'student@reg.com',
      })
      .expect(201);

    const body = response.body as RegistrationResponse;

    expect(body.status).toBe('CHECKED_IN');
  });
});
