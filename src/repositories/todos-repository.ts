import { mysqlDateTime, withinConnection } from '../adapters/mysql';
import { Context } from '../entities/context';
import { OrderBy } from '../entities/enums';
import { Todo, TodoRow } from '../entities/todo';

export const TODOS_TABLE = 'todos';

interface FindManyArgs {
  ctx: Context;
  created?: OrderBy;
}
export async function findMany({
  created = OrderBy.Asc,
}: FindManyArgs): Promise<Todo[]> {
  return withinConnection({
    callback: async (conn) => {
      const todoRows = await conn
        .table(TODOS_TABLE)
        .orderBy('created_at', created);

      return todoRows.map(reverseTransform);
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
    completed: todoRow.completed,
    listId: todoRow.list_id,
    createdAt: new Date(todoRow.created_at),
  };
}
