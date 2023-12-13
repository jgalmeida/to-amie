import gql from 'graphql-tag';

const TodoGQL = gql`
  type Todo {
    id: Int!
    name: String
    completed: Boolean
    listId: Int
    createdAt: Date
  }

  extend type Query {
    todos(limit: Int, after: Int): [Todo]
    todo(id: Int!): Todo
  }

  input CreateTodoInput {
    name: String!
    listId: Int!
  }

  extend type Mutation {
    createTodo(input: CreateTodoInput): Todo
    completeTodo(id: Int!): Todo
  }
`;

export default TodoGQL;
