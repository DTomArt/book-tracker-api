import 'dotenv/config';
import { Book } from '../books/entities/book.entity';
import { Comment } from '../comments/entities/comment.entity';
import { User } from '../users/entities/user.entity';

export const dbConfig = {
  type: process.env.DB_TYPE as any,
  host: process.env.PG_HOST,
  port: Number(process.env.PG_PORT) || 5432,
  username: process.env.PG_USER,
  password: process.env.PG_PASSWORD,
  database: process.env.PG_DB,
  entities: [User, Book, Comment],
  synchronize: false,
};
