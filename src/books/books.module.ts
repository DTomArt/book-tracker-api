import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CommentsModule } from '../comments/comments.module';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Book]), CommentsModule],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
