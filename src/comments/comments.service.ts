import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from '../comments/entities/comment.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  public async getLatestCommentsPerBook(
    bookIds: string[],
    perBookLimit = 5,
  ): Promise<Record<string, Comment[]>> {
    if (bookIds.length === 0) {
      return {};
    }

    const subQuery = this.commentRepository
      .createQueryBuilder('comment')
      .select([
        'comment.id AS id',
        'comment.content AS content',
        'comment.author AS author',
        'comment.bookId AS "bookId"',
        'comment.userId AS "userId"',
        'comment.createdAt AS "createdAt"',
        'comment.updatedAt AS "updatedAt"',
        'ROW_NUMBER() OVER (PARTITION BY comment.bookId ORDER BY comment.createdAt DESC, comment.id DESC) AS row_num',
      ])
      .where('comment.bookId IN (:...bookIds)', { bookIds });

    const rows = await this.commentRepository.manager
      .createQueryBuilder()
      .select('*')
      .from(`(${subQuery.getQuery()})`, 'ranked')
      .setParameters(subQuery.getParameters())
      .where('ranked.row_num <= :perBookLimit', { perBookLimit })
      .orderBy('ranked."bookId"', 'ASC')
      .addOrderBy('ranked."createdAt"', 'DESC')
      .getRawMany();

    const grouped: Record<string, Comment[]> = {};

    for (const row of rows) {
      const rowBookId = row.bookId ?? row.bookid;
      const rowUserId = row.userId ?? row.userid;

      const mappedComment = this.commentRepository.create({
        id: row.id,
        content: row.content,
        author: row.author,
        bookId: rowBookId,
        userId: rowUserId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      });

      if (!grouped[rowBookId]) {
        grouped[rowBookId] = [];
      }

      grouped[rowBookId].push(mappedComment);
    }

    return grouped;
  }
}
