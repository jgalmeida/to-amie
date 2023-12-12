import { withinConnection } from '../adapters/mysql';
import { Context } from '../entities/context';
import { NewTodoLink, TodoLink, TodoLinkRow } from '../entities/todo-link';
import { isDefined } from '../tools/is';

export const TODOS_LINKS_TABLE = 'todos_links';

interface FindOneArgs {
  ctx: Context;
  connectionId: string;
  todoId?: string;
  providerId?: string;
}
export async function findOne({
  ctx,
  connectionId,
  todoId,
  providerId,
}: FindOneArgs): Promise<TodoLink> {
  return withinConnection({
    callback: async (conn) => {
      const todoLinkRow = await conn
        .table(TODOS_LINKS_TABLE)
        .where((builder) => {
          isDefined(connectionId, () =>
            builder.where({ connection_id: connectionId }),
          );
          isDefined(todoId, () => builder.where({ todo_id: todoId }));
          isDefined(providerId, () =>
            builder.where({ provider_id: providerId }),
          );
        })
        .first();

      return todoLinkRow ? reverseTransform(todoLinkRow) : undefined;
    },
  });
}

interface CreateArgs {
  ctx: Context;
  newTodoLink: Omit<NewTodoLink, 'id'>;
}
export async function create({ newTodoLink }: CreateArgs): Promise<TodoLink> {
  return withinConnection({
    callback: async (conn) => {
      const ids = await conn
        .table(TODOS_LINKS_TABLE)
        .insert(transform(newTodoLink as TodoLink)); // Insert doesn't have ID

      return {
        id: ids[0],
        ...newTodoLink,
      };
    },
  });
}

export function transform(todo: TodoLink): TodoLinkRow {
  return {
    id: todo.id,
    connection_id: todo.connectionId,
    todo_id: todo.todoId,
    provider_id: todo.providerId,
  };
}

export function reverseTransform(todoLinkRow: TodoLinkRow): TodoLink {
  return {
    id: todoLinkRow.id,
    connectionId: todoLinkRow.connection_id,
    todoId: todoLinkRow.todo_id,
    providerId: todoLinkRow.provider_id,
  };
}
