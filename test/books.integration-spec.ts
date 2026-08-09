/// <reference types="jest" />

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import request from 'supertest';
import { BooksController } from '../src/books/books.controller';
import { BooksService } from '../src/books/books.service';
import { Book } from '../src/books/entities/book.entity';
import { CommentsService } from '../src/comments/comments.service';
import { UsersService } from '../src/users/users.service';
import { AuthGuard } from '../src/auth/guards/auth.guard';
import { Server } from 'http';

describe('Books HTTP integration', () => {
  const repositoryMock = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const commentsServiceMock = {
    getLatestCommentsPerBook: jest.fn(),
    createComment: jest.fn(),
  };

  const usersServiceMock = {
    findUserById: jest.fn(),
  };

  const jwtServiceMock = {
    verifyAsync: jest.fn().mockResolvedValue({ sub: 'test-user-id' }),
  };

  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: repositoryMock,
        },
        {
          provide: CommentsService,
          useValue: commentsServiceMock,
        },
        {
          provide: UsersService,
          useValue: usersServiceMock,
        },
        {
          provide: AuthGuard,
          useClass: AuthGuard,
        },
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('rejects invalid create payload with 400', async () => {
    const response = await request(app.getHttpServer() as Server)
      .post('/books')
      .set('Authorization', 'Bearer any-token')
      .send({
        title: 'Book title',
        author: 'Author',
        isbn: '9780132350884',
        numberOfPages: 464,
        rating: 7,
      });

    expect(response.status).toBe(400);
  });

  it('creates comment for a valid request', async () => {
    repositoryMock.findOne.mockResolvedValue({
      id: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
    });
    usersServiceMock.findUserById.mockResolvedValue({
      id: 'test-user-id',
      username: 'Tom',
    });
    commentsServiceMock.createComment.mockResolvedValue({
      id: '3f6a1cda-27fa-4f4e-8c73-8a90f576f0a3',
      content: 'Great book',
      author: 'Tom',
      bookId: 'c56a4180-65aa-42ec-a945-5fd21dec0538',
      userId: 'test-user-id',
    });

    const response = await request(app.getHttpServer() as Server)
      .post('/books/c56a4180-65aa-42ec-a945-5fd21dec0538/comments')
      .set('Authorization', 'Bearer any-token')
      .send({ content: 'Great book' });

    expect(response.status).toBe(201);
    expect(response.body).toEqual(
      expect.objectContaining({
        content: 'Great book',
        author: 'Tom',
      }),
    );
  });
});
