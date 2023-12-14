import { v4 as uuidv4 } from 'uuid';

import { Todo } from '../../src/entities/todo';
import { ACCOUNT_ID, DEFAULT_LIST_ID } from '../../src/constants';

export function createTodo(todo?: Partial<Todo>): Omit<Todo, 'id'> {
  const id = uuidv4();

  const defaultTodo = {
    accountId: ACCOUNT_ID,
    name: `Todo - ${id}`,
    completed: false,
    listId: DEFAULT_LIST_ID,
    createdAt: new Date(),
  };

  return {
    ...defaultTodo,
    ...todo,
  };
}

export function createNewTodo(
  todo?: Partial<Todo>,
): Omit<Todo, 'id' | 'createdAt'> {
  const newTodo = createTodo(todo);

  delete newTodo.createdAt;

  return newTodo;
}
