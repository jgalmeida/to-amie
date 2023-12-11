import { v4 as uuidv4 } from 'uuid';

import { Todo } from '../../src/entities/todo';

export function createTodo(todo?: Partial<Todo>): Omit<Todo, 'id'> {
  const id = uuidv4();

  const defaultTodo = {
    name: `Todo - ${id}`,
    completed: false,
    listId: 1,
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
