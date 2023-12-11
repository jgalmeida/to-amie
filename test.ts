import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import cors from '@koa/cors';
import { ApolloServer } from '@apollo/server';
import { koaMiddleware } from '@as-integrations/koa';

// The GraphQL schema
const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;

// A map of functions which return data for the schema.
const resolvers = {
  Query: {
    hello: () => 'world',
  },
};

async function init() {
  const app = new Koa();
  // Set up Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await server.start();

  app.use(cors());
  app.use(bodyParser());
  app.use(
    koaMiddleware(server, {
      context: async ({ ctx }) => ({ token: ctx.headers.token }),
    }),
  );

  app.listen({ port: 4000 });
  console.log(`🚀 Server ready at http://localhost:4000`);
}

init();
