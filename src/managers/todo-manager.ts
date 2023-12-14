import { Paginated } from '../entities/common';
import { Context } from '../entities/context';
import { OrderBy } from '../entities/enums';
import { EventType } from '../entities/event';
import { NewTodo, Todo } from '../entities/todo';
import * as todoRepository from '../repositories/todos-repository';
import { isDefined } from '../tools/is';
import * as eventManager from './event-manager';

interface FindManyArgs {
  ctx: Context;
  created?: OrderBy;
  limit?: number;
  after?: number;
}

export async function findMany(args: FindManyArgs): Promise<Paginated<Todo[]>> {
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
  const newTodo = await todoRepository.create({
    ctx,
    todo: {
      ...todo,
      completed: false,
      createdAt: new Date(),
    },
  });

  await eventManager.emit({
    type: EventType.Create,
    data: newTodo,
  });

  return newTodo;
}

interface UpdateArgs {
  ctx: Context;
  id: number;
  name: string;
  completed?: boolean;
}

export async function update({
  ctx,
  id,
  name,
  completed,
}: UpdateArgs): Promise<Todo> {
  const todo = await findOne({
    ctx,
    id,
  });

  todo.name = name;

  isDefined(completed, () => (todo.completed = completed));

  const updatedTodo = await todoRepository.update({
    ctx,
    todo,
  });

  await eventManager.emit({
    type: EventType.Update,
    data: updatedTodo,
  });

  return updatedTodo;
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

  const updatedTodo = await todoRepository.update({
    ctx,
    todo,
  });

  await eventManager.emit({
    type: EventType.Complete,
    data: updatedTodo,
  });

  return updatedTodo;
}
