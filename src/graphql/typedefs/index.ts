import gql from 'graphql-tag';

import todo from './todo';

const root = gql`
  scalar Date

  type Query {
    root: String
  }

  type Mutation {
    root: String
  }
`;

export default [root, todo];
