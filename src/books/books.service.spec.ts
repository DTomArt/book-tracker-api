/// <reference types="jest" />

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { Comment as BookComment } from '../comments/entities/comment.entity';
import { Repository } from 'typeorm';
import { CommentsService } from '../comments/comments.service';
import { UsersService } from '../users/users.service';

describe('BooksService', () => {
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

  let booksService: BooksService;

  beforeEach(() => {
    jest.clearAllMocks();

    booksService = new BooksService(
      repositoryMock as unknown as Repository<Book>,
      commentsServiceMock as unknown as CommentsService,
      usersServiceMock as unknown as UsersService,
    );
  });

  it('normalizes ISBN when creating a book', async () => {
    const createdBook = {
      title: 'Book title',
      author: 'Author',
      isbn: '9780132350884',
      numberOfPages: 464,
      rating: 5,
      userId: 'user-1',
    } as Book;

    repositoryMock.create.mockReturnValue(createdBook);
    repositoryMock.save.mockResolvedValue(createdBook);

    await booksService.createBook('user-1', {
      title: 'Book title',
      author: 'Author',
      isbn: '978-0-13-235088-4',
      numberOfPages: 464,
      rating: 5,
    });

    expect(repositoryMock.create).toHaveBeenCalledWith(
      expect.objectContaining({ isbn: '9780132350884' }),
    );
  });

  it('throws when ISBN is invalid', async () => {
    await expect(
      booksService.createBook('user-1', {
        title: 'Book title',
        author: 'Author',
        isbn: 'invalid-isbn',
        numberOfPages: 464,
        rating: 5,
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws when adding comment to missing book', async () => {
    repositoryMock.findOne.mockResolvedValue(null);

    await expect(
      booksService.addComment('book-1', 'user-1', {
        content: 'Comment body',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('creates comment when book and user exist', async () => {
    const existingBook = { id: 'book-1' } as Book;
    const existingUser = { id: 'user-1', username: 'Tom' };
    const createdComment = {
      id: 'comment-1',
      content: 'Comment body',
      author: 'Tom',
      bookId: 'book-1',
      userId: 'user-1',
    } as BookComment;

    repositoryMock.findOne.mockResolvedValue(existingBook);
    usersServiceMock.findUserById.mockResolvedValue(existingUser);
    commentsServiceMock.createComment.mockResolvedValue(createdComment);

    const result = await booksService.addComment('book-1', 'user-1', {
      content: 'Comment body',
    });

    expect(commentsServiceMock.createComment).toHaveBeenCalledWith({
      content: 'Comment body',
      author: 'Tom',
      bookId: 'book-1',
      userId: 'user-1',
    });
    expect(result).toEqual(createdComment);
  });
});
