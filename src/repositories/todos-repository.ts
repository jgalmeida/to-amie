import { mysqlDateTime, withinConnection } from '../adapters/mysql';
import { Paginated } from '../entities/common';
import { Context } from '../entities/context';
import { OrderBy } from '../entities/enums';
import { Todo, TodoRow } from '../entities/todo';
import { isDefined } from '../tools/is';

export const TODOS_TABLE = 'todos';

interface FindManyArgs {
  ctx: Context;
  created?: OrderBy;
  limit?: number;
  after?: number;
}
export async function findMany({
  ctx,
  created = OrderBy.Asc,
  limit = 10,
  after,
}: FindManyArgs): Promise<Paginated<Todo[]>> {
  return withinConnection({
    callback: async (conn) => {
      const todoRows = await conn
        .table(TODOS_TABLE)
        .where((builder) => {
          builder.where({ account_id: ctx.accountId });

          // Incremental ID's, to ease development, also better for pagination without offset usage
          isDefined(after, () => builder.where('id', '>', after));
        })
        .orderBy('created_at', created)
        .limit(limit);

      const data = todoRows.map(reverseTransform);

      return {
        data,
        hasMore: data.length && data.length === limit,
        after: data.length ? data[data.length - 1].id : null,
      };
    },
  });
}

interface FindOneArgs {
  ctx: Context;
  id: number;
}
export async function findOne({ ctx, id }: FindOneArgs): Promise<Todo> {
  return withinConnection({
    callback: async (conn) => {
      const todo = await conn
        .table(TODOS_TABLE)
        .where({ account_id: ctx.accountId })
        .where({ id })
        .first();

      return todo ? reverseTransform(todo) : undefined;
    },
  });
}

interface CreateArgs {
  ctx: Context;
  todo: Omit<Todo, 'id'>;
}
export async function create({ todo }: CreateArgs): Promise<Todo> {
  return withinConnection({
    callback: async (conn) => {
      const ids = await conn.table(TODOS_TABLE).insert(transform(todo as Todo)); // Insert doesn't have ID

      return {
        id: ids[0],
        ...todo,
      };
    },
  });
}

interface UpdateArgs {
  ctx: Context;
  todo: Todo;
}
export async function update({ ctx, todo }: UpdateArgs): Promise<Todo> {
  return withinConnection({
    callback: async (conn) => {
      await conn
        .table(TODOS_TABLE)
        .where({ account_id: ctx.accountId })
        .where({ id: todo.id })
        .update({ name: todo.name, completed: todo.completed });

      return todo;
    },
  });
}

export function transform(todo: Todo): TodoRow {
  return {
    id: todo.id,
    account_id: todo.accountId,
    name: todo.name,
    completed: todo.completed,
    list_id: todo.listId,
    created_at: mysqlDateTime(todo.createdAt),
  };
}

export function reverseTransform(todoRow: TodoRow): Todo {
  return {
    id: todoRow.id,
    accountId: todoRow.account_id,
    name: todoRow.name,
    completed: Boolean(todoRow.completed),
    listId: todoRow.list_id,
    createdAt: new Date(todoRow.created_at),
  };
}
