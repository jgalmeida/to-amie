import supertest from 'supertest';
import { createApp } from '../src/app';
import { createDatabase, dropDatabase } from './tools/mysql';
import { closeDatabaseConnection } from '../src/adapters/mysql';

export async function startApp() {
  const databaseConfig = await createDatabase();

  const app = await createApp(databaseConfig);

  return supertest(app);
}

export async function stopApp() {
  await closeDatabaseConnection();

  await dropDatabase();
}
