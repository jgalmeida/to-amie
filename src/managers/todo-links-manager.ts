import { Context } from '../entities/context';
import { NewTodoLink, TodoLink } from '../entities/todo-link';
import * as todoLinksRepository from '../repositories/todos-links-repository';

export async function findOne(
  args: todoLinksRepository.FindOneArgs,
): Promise<TodoLink | undefined> {
  return todoLinksRepository.findOne(args);
}

interface CreateArgs {
  ctx: Context;
  todoLink: NewTodoLink;
}

export async function create({ ctx, todoLink }: CreateArgs): Promise<TodoLink> {
  return todoLinksRepository.create({
    ctx,
    newTodoLink: todoLink,
  });
}
