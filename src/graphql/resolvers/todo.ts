import { Resolvers } from '../generated/graphql';

const resolvers: Resolvers = {
  Query: {
    todos: (_, { limit, after }) => {
      return [
        {
          id: 1,
          name: 'super todo',
          completed: false,
          listId: 1,
          createdAt: new Date(),
        },
      ];
    },
    todo: (_, { id }) => {
      return {
        id: 1,
        name: 'super todo',
        completed: false,
        listId: 1,
        createdAt: new Date(),
      };
    },
  },
};

export default resolvers;
