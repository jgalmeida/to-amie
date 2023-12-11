import { MySqlContainer, StartedMySqlContainer } from '@testcontainers/mysql';

import { logger } from '../../src/logger';
import { getConnection } from '../../src/adapters/mysql';
import { DatabaseConfig } from '../../src/constants';
import { NewTodo } from '../../src/entities/todo';
import { TODOS_TABLE, transform } from '../../src/repositories/todo-repository';

let databaseContainer: StartedMySqlContainer;

export async function createDatabase(): Promise<DatabaseConfig> {
  logger.info('Creating database container...');
  databaseContainer = await new MySqlContainer().start();
  logger.info('Database database created.');

  return {
    host: databaseContainer.getHost(),
    port: databaseContainer.getPort(),
    user: databaseContainer.getUsername(),
    password: databaseContainer.getRootPassword(),
    database: databaseContainer.getDatabase(),
  };
}

export async function dropDatabase(): Promise<void> {
  logger.info('Stopping database container...');
  await databaseContainer.stop();
  logger.info('Database container stopped.');
}

export async function seedTodos(todos: NewTodo[]): Promise<void> {
  const connection = getConnection();

  await connection.table(TODOS_TABLE).insert(todos.map(transform));
}

export async function truncateTables(): Promise<void> {
  const connection = getConnection();

  await connection.table(TODOS_TABLE).delete();
}
