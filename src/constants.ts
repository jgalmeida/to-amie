import assert from 'assert';
export interface DatabaseConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}
export const databaseConfig: DatabaseConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT) || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'root',
  database: process.env.MYSQL_DATABASE || 'amie-api',
};

export const env = {
  isLive: process.env.NODE_ENV === 'live',
  isTest: process.env.NODE_ENV === 'test',
  isDev: process.env.NODE_ENV === 'dev',
  isDebug: !(
    'live' === process.env.NODE_ENV || 'test' === process.env.NODE_ENV
  ),
};

assert(process.env.TODOIST_TOKEN, 'Please provide TODOIST api token');
export const TODO_IST_TOKEN = process.env.TODOIST_TOKEN;

export const ACCOUNT_ID = 1;
export const DEFAULT_LIST_ID = 1;
