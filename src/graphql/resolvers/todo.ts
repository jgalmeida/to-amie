import { Resolvers } from '../generated/graphql';

import * as todoManager from '../../managers/todo-manager';
import * as syncManager from '../../managers/sync-manager';

const resolvers: Resolvers = {
  Query: {
    todos: (_, { limit, after }, ctx) => {
      return todoManager.findMany({
        ctx,
        limit,
        after,
      });
    },
    todo: (_, { id }, ctx) => {
      return todoManager.findOne({
        ctx,
        id,
      });
    },
  },
  Mutation: {
    startSync: async (_, { connectionId }, ctx) => {
      return syncManager.startSync({ ctx, connectionId });
    },
    createTodo: async (_, { input }, ctx) => {
      const todo = await todoManager.create({
        ctx,
        todo: {
          ...input,
          accountId: ctx.accountId,
        },
      });

      return todo;
    },
    updateTodo: async (_, { input }, ctx) => {
      const todo = await todoManager.update({
        ctx,
        id: input.id,
        name: input.name,
      });

      return todo;
    },
    completeTodo: async (_, { id }, ctx) => {
      const todo = await todoManager.complete({
        ctx,
        id,
      });

      return todo;
    },
  },
};

export default resolvers;
