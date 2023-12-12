import { Context } from '../entities/context';
import { OrderBy } from '../entities/enums';
import { NewTodo, Todo } from '../entities/todo';
import * as todoRepository from '../repositories/todos-repository';

interface FindManyArgs {
  ctx: Context;
  created?: OrderBy;
}

export async function findMany(args: FindManyArgs): Promise<Todo[]> {
  return todoRepository.findMany(args);
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
      createdAt: new Date(),
    },
  });
}
