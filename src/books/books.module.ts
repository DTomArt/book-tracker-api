import { Module } from '@nestjs/common';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { CommentsModule } from '../comments/comments.module';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Book]),
    CommentsModule,
    UsersModule,
  ],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}
