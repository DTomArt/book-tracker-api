import {
  Body,
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Query,
  Request,
  UseGuards,
  HttpCode,
  HttpStatus,
  NotFoundException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { CreateBookDto } from './entities/dto/create-book.dto';
import { BooksService } from './books.service';
import {
  type AuthenticatedRequest,
  AuthGuard,
} from '../auth/guards/auth.guard';
import { UpdateBookDto } from './entities/dto/update-book.dto';
import { GetBooksDto } from './entities/dto/get-books.dto';
import { CreateCommentDto } from '../comments/entities/dto/create-comment.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Get(':bookId')
  getBook(@Param('bookId', new ParseUUIDPipe()) bookId: string) {
    return this.booksService.getBook(bookId);
  }

  @Get()
  getBooks(@Query() getBooksDto: GetBooksDto) {
    return this.booksService.getBooks(getBooksDto);
  }

  @UseGuards(AuthGuard)
  @Post()
  createBook(
    @Request() request: AuthenticatedRequest,
    @Body() createBookDto: CreateBookDto,
  ) {
    return this.booksService.createBook(request.userId, createBookDto);
  }

  @UseGuards(AuthGuard)
  @Post(':bookId/comments')
  addComment(
    @Param('bookId', new ParseUUIDPipe()) bookId: string,
    @Request() request: AuthenticatedRequest,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.booksService.addComment(
      bookId,
      request.userId,
      createCommentDto,
    );
  }

  @UseGuards(AuthGuard)
  @Patch(':bookId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBook(
    @Param('bookId', new ParseUUIDPipe()) bookId: string,
    @Request() request: AuthenticatedRequest,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    const patched = await this.booksService.updateBook(
      bookId,
      request.userId,
      updateBookDto,
    );

    if (!patched) {
      throw new NotFoundException('Book not found');
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':bookId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBook(
    @Param('bookId', new ParseUUIDPipe()) bookId: string,
    @Request() request: AuthenticatedRequest,
  ) {
    const removed = await this.booksService.deleteBook(bookId, request.userId);

    if (!removed) {
      throw new NotFoundException('Book not found');
    }
  }
}
