import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Response } from 'supertest';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { Server } from 'http';

const runDatabaseE2E = process.env.RUN_DB_E2E === 'true';
const describeDatabaseE2E = runDatabaseE2E ? describe : describe.skip;

describeDatabaseE2E('Book Tracker API (e2e)', () => {
  let app: INestApplication;
  let accessToken = '';

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('logs in and returns access token', async () => {
    const response = await request(app.getHttpServer() as Server)
      .post('/auth/login')
      .send({
        username: 'Tom',
        password: 'secretpass',
      })
      .expect(201);

    expect(response.body.accessToken).toBeDefined();
    expect(typeof response.body.accessToken).toBe('string');
    accessToken = response.body.accessToken;
  });

  it('returns books list with pagination shape', () => {
    return request(app.getHttpServer() as Server)
      .get('/books?limit=3')
      .expect(200)
      .expect((response: Response) => {
        expect(Array.isArray(response.body.data)).toBe(true);
        expect(typeof response.body.hasNextPage).toBe('boolean');
      });
  });

  it('creates a book on authenticated endpoint', async () => {
    await request(app.getHttpServer() as Server)
      .post('/books')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        title: 'E2E Test Book',
        author: 'E2E Author',
        isbn: '9780132350884',
        numberOfPages: 464,
        rating: 5,
      })
      .expect(201);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });
});
