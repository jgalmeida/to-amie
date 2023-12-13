import { Context } from '../entities/context';
import { OrderBy } from '../entities/enums';
import { NewTodo, Todo } from '../entities/todo';
import * as todoRepository from '../repositories/todos-repository';

interface FindManyArgs {
  ctx: Context;
  created?: OrderBy;
  limit?: number;
  after?: number;
}

export async function findMany(args: FindManyArgs): Promise<Todo[]> {
  return todoRepository.findMany(args);
}

interface FindOneArgs {
  ctx: Context;
  id: number;
}

export async function findOne(args: FindOneArgs): Promise<Todo> {
  const todo = await todoRepository.findOne(args);

  if (!todo) {
    throw new Error('Todo not found');
  }

  return todo;
}

interface CreateArgs {
  ctx: Context;
  todo: NewTodo;
}

export async function create({ ctx, todo }: CreateArgs): Promise<Todo> {
  return todoRepository.create({
    ctx,
    todo: {
      ...todo,
      completed: false,
      createdAt: new Date(),
    },
  });
}

interface CompleteArgs {
  ctx: Context;
  id: number;
}

export async function complete({ ctx, id }: CompleteArgs): Promise<Todo> {
  const todo = await findOne({
    ctx,
    id,
  });

  todo.completed = true;

  return todoRepository.update({
    ctx,
    todo,
  });
}
