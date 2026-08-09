import { hash } from 'bcrypt';
import dataSource from '../data-source';
import { User } from '../../users/entities/user.entity';

const seedUsername = 'Tom';
const seedPassword = 'secretpass';
const saltRounds = 10;

async function seedUser(): Promise<void> {
  await dataSource.initialize();

  try {
    const usersRepository = dataSource.getRepository(User);
    const existingUser = await usersRepository.findOne({
      where: { username: seedUsername },
    });

    if (existingUser) {
      console.log(`Seeded user already exists: ${seedUsername}`);
      return;
    }

    const passwordHash = await hash(seedPassword, saltRounds);

    const user = usersRepository.create({
      username: seedUsername,
      passwordHash,
    });

    await usersRepository.save(user);
    console.log(`Created seeded user: ${seedUsername}`);
  } finally {
    await dataSource.destroy();
  }
}

seedUser().catch((error: unknown) => {
  console.error('Failed to seed user', error);
  process.exit(1);
});
