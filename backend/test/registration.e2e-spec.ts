import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { getDataSourceToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';

describe('RegistrationController (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let adminToken: string;
  let studentToken: string;
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

    const hashed = await bcrypt.hash('pass', 10);
    // Seed admin
    await dataSource.query(
      `INSERT INTO "user" (email, password, username, role) VALUES ('admin@reg.com', $1, 'Admin', 'ADMIN')`,
      [hashed],
    );
    // Seed student
    const studentRes = await dataSource.query(
      `INSERT INTO "user" (email, password, username, role) VALUES ('student@reg.com', $1, 'Student', 'STUDENT') RETURNING id`,
      [hashed],
    );

    // Get tokens
    const loginAdmin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@reg.com', password: 'pass' });
    adminToken = loginAdmin.body.accessToken;

    const loginStudent = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'student@reg.com', password: 'pass' });
    studentToken = loginStudent.body.accessToken;

    // Create event
    const eventRes = await request(app.getHttpServer())
      .post('/events')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Reg Test Event',
        location: 'Hall A',
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 172800000).toISOString(),
        eventCategory: 'ACADEMIC',
        status: 'UPCOMING',
      });
      
    if (eventRes.status !== 201) {
      console.error('Event creation failed:', eventRes.body);
    }
    eventId = eventRes.body.id;
  });

  afterAll(async () => {
    if (app) await app.close();
  });

  it('/api/v1/registrations/events/:eventId/register (POST) - Register for event', async () => {
    const response = await request(app.getHttpServer())
      .post(`/registrations/events/${eventId}/register`)
      .set('Authorization', `Bearer ${studentToken}`);
      
    if (response.status !== 201) {
      console.error('Registration failed:', response.body);
    }
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('REGISTERED');
  });

  it('/api/v1/registrations/my-events (GET) - Get my registrations', async () => {
    const response = await request(app.getHttpServer())
      .get('/registrations/my-events')
      .set('Authorization', `Bearer ${studentToken}`)
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(1);
    expect(response.body[0].eventId).toBe(eventId);
  });

  it('/api/v1/registrations/events/:eventId/manual-checkin (POST) - Check-in', async () => {
    // Update event to ONGOING so check-in is allowed
    await request(app.getHttpServer())
      .patch(`/events/${eventId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'ONGOING' })
      .expect(200);

    const response = await request(app.getHttpServer())
      .post(`/registrations/events/${eventId}/manual-checkin`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        email: 'student@reg.com'
      })
      .expect(201);

    expect(response.body.status).toBe('CHECKED_IN');
  });
});
