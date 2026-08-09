import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateBookDto } from './entities/dto/create-book.dto';
import { Book } from './entities/book.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateBookDto } from './entities/dto/update-book.dto';
import { GetBooksDto } from './entities/dto/get-books.dto';
import { CommentsService } from '../comments/comments.service';
import { Comment as BookComment } from '../comments/entities/comment.entity';

type BooksWithComments = Array<Book & { comments: BookComment[] }>;

type PaginationResult = {
  data: BooksWithComments;
  nextCursor: string | null;
  hasNextPage: boolean;
};

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    private readonly commentsService: CommentsService,
  ) {}

  public async getBooks(getBooksDto: GetBooksDto): Promise<PaginationResult> {
    const { limit, cursor } = getBooksDto;
    const safeLimit = Math.min(limit ?? 20, 100);
    const query = this.bookRepository
      .createQueryBuilder('books')
      .orderBy('books.id', 'DESC')
      .take(safeLimit + 1);

    if (cursor) {
      query.andWhere('books.id < :cursor', {
        cursor: cursor,
      });
    }

    const books = await query.getMany();

    const hasNextPage = books.length > safeLimit;

    if (hasNextPage) {
      books.pop();
    }

    const nextCursor =
      hasNextPage && books.length > 0
        ? String(books[books.length - 1].id)
        : null;

    const booksWithComments = await this.getBooksWithComments(books);

    return {
      data: booksWithComments,
      nextCursor,
      hasNextPage,
    };
  }

  private async getBooksWithComments(
    books: Book[],
  ): Promise<BooksWithComments> {
    const bookIds = books.map((book) => book.id);

    const commentsByBookId =
      await this.commentsService.getLatestCommentsPerBook(bookIds);

    const booksWithComments: BooksWithComments = books.map((book) => {
      const comments = commentsByBookId[book.id] ?? [];

      return { ...book, comments };
    });

    return booksWithComments;
  }

  public async createBook(
    createBookDto: CreateBookDto,
    userId: string,
  ): Promise<Book> {
    const isbn = this.normalizeAndValidateISBN(createBookDto.isbn);

    const book = this.bookRepository.create({
      ...createBookDto,
      isbn,
      userId,
    });
    const savedBook = await this.bookRepository.save(book);

    return savedBook;
  }

  public async updateBook(
    updateBookDto: UpdateBookDto,
    bookId: string,
    userId: string,
  ): Promise<boolean> {
    const { ...payload } = updateBookDto;

    if (payload.isbn !== undefined) {
      payload.isbn = this.normalizeAndValidateISBN(payload.isbn);
    }
    const res = await this.bookRepository.update(
      { id: bookId, userId },
      payload,
    );

    return !!res?.affected;
  }

  public async deleteBook(id: string, userId: string): Promise<boolean> {
    const res = await this.bookRepository.delete({ id, userId });

    return !!res?.affected;
  }

  private normalizeAndValidateISBN(isbn: string): string {
    isbn = isbn.replace(/[-\s]/g, '').toUpperCase();
    if (!this.validateISBN(isbn)) {
      throw new BadRequestException('ISBN is not valid');
    }

    return isbn;
  }

  private validateISBN(normalizedIsbn: string): boolean {
    if (/^\d{9}[\dX]$/.test(normalizedIsbn)) {
      return this.isValidIsbn10(normalizedIsbn);
    }

    if (/^\d{13}$/.test(normalizedIsbn)) {
      return this.isValidIsbn13(normalizedIsbn);
    }

    return false;
  }

  private isValidIsbn10(normalizedIsbn10: string): boolean {
    let checksumTotal = 0;

    for (let digitIndex = 0; digitIndex < 10; digitIndex += 1) {
      const currentCharacter = normalizedIsbn10[digitIndex];
      const digitValue =
        currentCharacter === 'X' ? 10 : Number.parseInt(currentCharacter, 10);
      const weight = 10 - digitIndex;

      checksumTotal += digitValue * weight;
    }

    return checksumTotal % 11 === 0;
  }

  private isValidIsbn13(normalizedIsbn13: string): boolean {
    let checksumTotal = 0;

    for (let digitIndex = 0; digitIndex < 13; digitIndex += 1) {
      const digitValue = Number.parseInt(normalizedIsbn13[digitIndex], 10);
      const weight = digitIndex % 2 === 0 ? 1 : 3;

      checksumTotal += digitValue * weight;
    }

    return checksumTotal % 10 === 0;
  }
}
