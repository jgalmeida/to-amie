import { koaMiddleware } from '@as-integrations/koa';
import cors from '@koa/cors';
import * as dotenv from 'dotenv';
import Koa from 'koa';
import bodyParser from 'koa-bodyparser';

import { initDatabaseConnection } from './adapters/mysql';
import { initListeners } from './listeners';
import { ACCOUNT_ID, DatabaseConfig } from './constants';
import { error, lifecycle } from './middlewares';
import { createApolloServer } from './graphql/server';
import { logger } from './logger';

dotenv.config();

export async function createApp(databaseConfig?: DatabaseConfig): Promise<Koa> {
  const app = new Koa();
  const apolloServer = createApolloServer();
  await apolloServer.start();

  await initDatabaseConnection(databaseConfig);
  initListeners();

  app
    .use(error)
    .use(lifecycle())
    .use(cors())
    .use(bodyParser())
    .use(
      koaMiddleware(apolloServer, {
        context: async () => ({
          log: logger,
          accountId: ACCOUNT_ID,
        }),
      }),
    );

  return app;
}
