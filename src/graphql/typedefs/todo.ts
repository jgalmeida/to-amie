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
    todos(limit: Int, after: ID): [Todo]
    todo(id: Int!): Todo
  }
`;

export default TodoGQL;
