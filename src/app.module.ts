import { Module } from '@nestjs/common';
import { CommentsModule } from './comments/comments.module';
import { BooksModule } from './books/books.module';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    CommentsModule,
    BooksModule,
    DatabaseModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
