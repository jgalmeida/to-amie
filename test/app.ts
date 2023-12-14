process.env.TODOIST_TOKEN = 'fake';

import supertest from 'supertest';
import { createApp } from '../src/app';
import { createDatabase, dropDatabase } from './tools/mysql';
import { closeDatabaseConnection } from '../src/adapters/mysql';

let stop: () => Promise<void>;
export async function startApp() {
  const databaseConfig = await createDatabase();

  const init = await createApp(databaseConfig);
  stop = init.stopApp;

  return supertest(init.app);
}

export async function stopApp() {
  await stop();
  await closeDatabaseConnection();

  await dropDatabase();
}
