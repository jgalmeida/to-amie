import knex, { Knex } from 'knex';
import path from 'path';

import * as connectionRepository from '../repositories/connections-repository';

import { ERR_DATABASE, ERR_DUPLICATE } from '../errors';
import { ACCOUNT_ID, TODO_IST_TOKEN, env } from '../constants';
import { Provider } from '../entities/provider';
import { Status } from '../entities/connection';
import logger from 'koa-pino-logger';

let pool: Knex;

interface MysqlOptions {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export async function initDatabaseConnection(opts: MysqlOptions) {
  pool = knex({
    client: 'mysql2',
    connection: opts,
    migrations: {
      directory: path.join(__dirname, 'migrations'),
      extension: 'ts',
    },
  });

  await pool.migrate.latest({
    directory: `${__dirname}/../migrations`,
  });

  await seed();
}

export function closeDatabaseConnection() {
  return pool.destroy();
}

export function getConnection(): Knex {
  return pool;
}

export async function withinConnection<T>({
  callback,
}: {
  callback: (conn: Knex) => Promise<T>;
}): Promise<T> {
  try {
    return await callback(pool);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      throw new ERR_DUPLICATE();
    }

    throw new ERR_DATABASE(err);
  }
}

export function mysqlDateTime(date: Date): string {
  return date.toISOString().slice(0, 23).replace('T', ' ');
}

export async function seed(): Promise<void> {
  const conn = getConnection();
  const connectionExists = await connectionRepository.findMany({
    ctx: {
      log: logger as any,
      accountId: ACCOUNT_ID,
    },
    provider: Provider.TODO_IST,
  });

  if (connectionExists.length) {
    return;
  }

  await Promise.all([
    connectionRepository.create({
      ctx: {
        log: logger as any,
        accountId: ACCOUNT_ID,
      },
      newConnection: {
        accountId: ACCOUNT_ID,
        provider: Provider.TODO_IST,
        status: Status.Stopped,
        token: TODO_IST_TOKEN,
        syncToken: null,
        syncTokenExpiresAt: null,
        updatedAt: new Date(),
      },
    }),
    conn.table('lists').insert(
      ['Home', 'Shopping', 'Holidays'].map((listName) => ({
        name: listName,
        account_id: ACCOUNT_ID,
        created_at: mysqlDateTime(new Date()),
      })),
    ),
  ]);
}
