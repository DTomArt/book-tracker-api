import { hash } from 'bcrypt';
import { In } from 'typeorm';
import dataSource from '../data-source';
import { User } from '../../users/entities/user.entity';
import { Book } from '../../books/entities/book.entity';
import { Comment } from '../../comments/entities/comment.entity';

const demoUserCount = 10;
const demoBookCount = 25;
const minCommentsPerBook = 1;
const maxCommentsPerBook = 10;
const demoUserPassword = 'secretpass';
const saltRounds = 10;

function getRandomInteger(minValue: number, maxValue: number): number {
  return Math.floor(Math.random() * (maxValue - minValue + 1)) + minValue;
}

function getRandomDateBetween(startDate: Date, endDate: Date): Date {
  const startTimestamp = startDate.getTime();
  const endTimestamp = endDate.getTime();
  const randomTimestamp = getRandomInteger(startTimestamp, endTimestamp);

  return new Date(randomTimestamp);
}

function pickRandomItem<T>(items: T[]): T {
  const randomIndex = getRandomInteger(0, items.length - 1);

  return items[randomIndex];
}

function generateValidIsbn13(): string {
  const isbnPrefix = '978';
  let isbnBase = isbnPrefix;

  for (let digitIndex = 0; digitIndex < 9; digitIndex += 1) {
    isbnBase += String(getRandomInteger(0, 9));
  }

  let checksumTotal = 0;

  for (let digitIndex = 0; digitIndex < isbnBase.length; digitIndex += 1) {
    const digitValue = Number.parseInt(isbnBase[digitIndex], 10);
    const weight = digitIndex % 2 === 0 ? 1 : 3;

    checksumTotal += digitValue * weight;
  }

  const checksumDigit = (10 - (checksumTotal % 10)) % 10;

  return `${isbnBase}${checksumDigit}`;
}

async function seedDemoData(): Promise<void> {
  await dataSource.initialize();

  try {
    const usersRepository = dataSource.getRepository(User);
    const booksRepository = dataSource.getRepository(Book);
    const commentsRepository = dataSource.getRepository(Comment);

    const demoUsernames = Array.from(
      { length: demoUserCount },
      (_, index) => `DemoUser${String(index + 1).padStart(2, '0')}`,
    );

    const existingDemoUsers = await usersRepository.find({
      where: {
        username: In(demoUsernames),
      },
    });

    if (existingDemoUsers.length > 0) {
      const existingDemoUserIds = existingDemoUsers.map((user) => user.id);
      await usersRepository.delete({ id: In(existingDemoUserIds) });
    }

    const now = new Date();
    const twoYearsAgo = new Date(now);
    twoYearsAgo.setFullYear(now.getFullYear() - 2);
    const sharedBooksCreatedAt = new Date('2025-01-15T12:00:00.000Z');
    const sharedCommentsCreatedAt = new Date('2025-03-20T09:30:00.000Z');

    const passwordHash = await hash(demoUserPassword, saltRounds);

    const usersToCreate = demoUsernames.map((username) => {
      const createdAt = getRandomDateBetween(twoYearsAgo, now);

      return usersRepository.create({
        username,
        passwordHash,
        createdAt,
        updatedAt: createdAt,
      });
    });

    const createdUsers = await usersRepository.save(usersToCreate);

    const booksToCreate: Book[] = [];
    const sharedBooksCount = Math.floor(demoBookCount / 2);

    for (let bookNumber = 1; bookNumber <= demoBookCount; bookNumber += 1) {
      const bookOwner = pickRandomItem(createdUsers);
      const usesSharedBookTimestamp = bookNumber <= sharedBooksCount;
      const createdAt = usesSharedBookTimestamp
        ? sharedBooksCreatedAt
        : getRandomDateBetween(twoYearsAgo, now);

      booksToCreate.push(
        booksRepository.create({
          title: `Seed Book ${bookNumber}`,
          author: `Seed Author ${getRandomInteger(1, 40)}`,
          isbn: generateValidIsbn13(),
          numberOfPages: getRandomInteger(120, 1200),
          rating: getRandomInteger(1, 5),
          userId: bookOwner.id,
          createdAt,
          updatedAt: createdAt,
        }),
      );
    }

    const createdBooks = await booksRepository.save(booksToCreate);

    const commentsToCreate: Comment[] = [];
    const pendingRandomComments: Comment[] = [];

    for (const [bookIndex, book] of createdBooks.entries()) {
      const isFirstBook = bookIndex === 0;
      const isSecondBook = bookIndex === 1;
      const isThirdBook = bookIndex === 2;
      const commentsCount = isFirstBook
        ? 0
        : isSecondBook
          ? 1
          : isThirdBook
            ? 10
            : getRandomInteger(minCommentsPerBook, maxCommentsPerBook);

      for (
        let commentNumber = 1;
        commentNumber <= commentsCount;
        commentNumber += 1
      ) {
        const commentOwner = pickRandomItem(createdUsers);
        const createdAt = getRandomDateBetween(book.createdAt, now);
        const pendingComment = commentsRepository.create({
          content: `Seed comment ${commentNumber} for ${book.title}`,
          author: commentOwner.username,
          bookId: book.id,
          userId: commentOwner.id,
          createdAt,
          updatedAt: createdAt,
        });

        pendingRandomComments.push(pendingComment);
      }
    }

    const sharedCommentsCount = Math.floor(pendingRandomComments.length / 2);

    for (
      let commentIndex = 0;
      commentIndex < pendingRandomComments.length;
      commentIndex += 1
    ) {
      const comment = pendingRandomComments[commentIndex];

      if (commentIndex < sharedCommentsCount) {
        comment.createdAt = sharedCommentsCreatedAt;
        comment.updatedAt = sharedCommentsCreatedAt;
      }

      commentsToCreate.push(comment);
    }

    if (commentsToCreate.length > 0) {
      await commentsRepository.save(commentsToCreate);
    }

    console.log(`Created users: ${createdUsers.length}`);
    console.log(`Created books: ${createdBooks.length}`);
    console.log(`Created comments: ${commentsToCreate.length}`);
    console.log(`Books with shared createdAt: ${sharedBooksCount}`);
    console.log(`Comments with shared createdAt: ${sharedCommentsCount}`);
    console.log('ISBN format: generated as valid ISBN-13 with checksum digit');
  } finally {
    await dataSource.destroy();
  }
}

seedDemoData().catch((error: unknown) => {
  console.error('Failed to seed demo data', error);
  process.exit(1);
});
