import { merge } from 'lodash';
import { Resolvers } from '../generated/graphql';

import { dateScalar } from '../scalars';
import todo from './todo';

const resolvers: Resolvers = merge(todo, dateScalar);

export default resolvers;
