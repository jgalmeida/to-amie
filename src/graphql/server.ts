import { ApolloServer } from '@apollo/server';
import { GraphQLError } from 'graphql';

import { env } from '../constants';
import { logger, Logger } from '../logger';
import resolvers from './resolvers';
import typeDefs from './typedefs';

export interface Context {
  log: Logger;
  accountId: number;
}

export function createApolloServer(): ApolloServer<Context> {
  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    introspection: !env.isLive,
    formatError: (err: any) => {
      logger.error({
        path: err.path,
        message: err.message,
        extensions: err.extensions,
      });
      return new GraphQLError(err.message, {
        extensions: { code: err.extensions },
      });
    },
  });

  return server;
}
