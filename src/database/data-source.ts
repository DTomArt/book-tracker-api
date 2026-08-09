import { DataSource } from 'typeorm';
import { dbConfig } from './config';

export default new DataSource({
  ...dbConfig,
  migrations: ['src/database/migrations/*{.ts,.js}'],
});
