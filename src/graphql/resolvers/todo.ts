import { Resolvers } from '../generated/graphql';

import * as todoManager from '../../managers/todo-manager';
import { logger } from '../../logger';

const resolvers: Resolvers = {
  Query: {
    todos: (_, { limit, after }, { accountId }) => {
      return todoManager.findMany({
        ctx: {
          log: logger,
          accountId,
        },
        limit,
        after,
      });
    },
    todo: (_, { id }, { accountId }) => {
      return todoManager.findOne({
        ctx: {
          log: logger,
          accountId,
        },
        id,
      });
    },
  },
  Mutation: {
    createTodo: async (_, { input }, { accountId }) => {
      const todo = await todoManager.create({
        ctx: {
          log: logger,
          accountId,
        },
        todo: {
          ...input,
          accountId,
        },
      });

      return todo;
    },
    completeTodo: async (_, { id }, { accountId }) => {
      const todo = await todoManager.complete({
        ctx: {
          log: logger,
          accountId,
        },
        id,
      });

      return todo;
    },
  },
};

export default resolvers;
