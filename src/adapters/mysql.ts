import knex, { Knex } from 'knex';
import path from 'path';
import { ERR_DATABASE, ERR_DUPLICATE } from '../errors';

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
