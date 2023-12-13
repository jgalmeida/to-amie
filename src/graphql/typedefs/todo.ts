import gql from 'graphql-tag';

const TodoGQL = gql`
  type Todo {
    id: Int!
    name: String
    completed: Boolean
    listId: Int
    createdAt: Date
  }

  type TodoOutput {
    hasMore: Boolean
    after: Int
    data: [Todo]
  }
  extend type Query {
    todos(limit: Int, after: Int): TodoOutput
    todo(id: Int!): Todo
  }

  input CreateTodoInput {
    name: String!
    listId: Int!
  }

  input UpdateTodoInput {
    id: Int!
    name: String!
  }

  extend type Mutation {
    startSync(connectionId: Int!): Boolean
    createTodo(input: CreateTodoInput): Todo
    updateTodo(input: UpdateTodoInput): Todo
    completeTodo(id: Int!): Todo
  }
`;

export default TodoGQL;
