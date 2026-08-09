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
} from '@nestjs/common';
import { CreateBookDto } from './entities/dto/create-book.dto';
import { BooksService } from './books.service';
import {
  type AuthenticatedRequest,
  AuthGuard,
} from '../auth/guards/auth.guard';
import { UpdateBookDto } from './entities/dto/update-book.dto';
import { GetBooksDto } from './entities/dto/get-books.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

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
    return this.booksService.createBook(createBookDto, request.userId);
  }

  @UseGuards(AuthGuard)
  @Patch(':bookId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateBook(
    @Param('bookId') bookId: string,
    @Request() request: AuthenticatedRequest,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    const patched = await this.booksService.updateBook(
      updateBookDto,
      bookId,
      request.userId,
    );

    if (!patched) {
      throw new NotFoundException('Book not found');
    }
  }

  @UseGuards(AuthGuard)
  @Delete(':bookId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBook(
    @Param('bookId') bookId: string,
    @Request() request: AuthenticatedRequest,
  ) {
    const removed = await this.booksService.deleteBook(bookId, request.userId);

    if (!removed) {
      throw new NotFoundException('Book not found');
    }
  }
}
