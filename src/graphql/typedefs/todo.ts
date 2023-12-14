import gql from 'graphql-tag';

const TodoGQL = gql`
  type Todo {
    id: Int!
    name: String
    completed: Boolean
    listId: Int
    createdAt: Date
  }

  type GroupBy {
    listId: [GroupByResult]
    name: [GroupByResult]
  }

  type GroupByResult {
    key: String
    todos: [Todo]
  }

  type TodosOutput {
    hasMore: Boolean
    after: Int
    data: [Todo]
    groupBy: GroupBy
  }

  extend type Query {
    todos(limit: Int, after: Int): TodosOutput
    todo(id: Int!): Todo
  }

  input CreateTodoInput {
    name: String!
    listId: Int
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
