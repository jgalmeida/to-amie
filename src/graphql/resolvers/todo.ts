import l from 'lodash';
import { GroupByResult, Resolvers } from '../generated/graphql';

import * as todoManager from '../../managers/todo-manager';
import * as syncManager from '../../managers/sync-manager';
import { DEFAULT_LIST_ID } from '../../constants';

const resolvers: Resolvers = {
  Query: {
    todos: (_, { limit, after, completed }, ctx) => {
      return todoManager.findMany({
        ctx,
        completed,
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
  TodosOutput: {
    groupBy: (parent) => {
      return parent.data as any;
    },
  },
  GroupBy: {
    name: (parent) => {
      return Object.entries(l.groupBy(parent, 'name')).map(([k, v]) => ({
        key: k,
        todos: v,
      })) as unknown as GroupByResult[];
    },
    listId: (parent) => {
      return Object.entries(l.groupBy(parent, 'listId')).map(([k, v]) => ({
        key: k,
        todos: v,
      })) as unknown as GroupByResult[];
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
          listId: input.listId ?? DEFAULT_LIST_ID,
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
