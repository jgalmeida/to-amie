import { Event, EventType } from '../entities/event';
import * as todoLinksManager from '../managers/todo-links-manager';
import * as connectionManager from '../managers/connections-manager';
import * as providerManager from '../managers/providers';
import { logger } from '../logger';
import { Provider } from '../entities/provider';

export async function onEventWriteTodoIst(event: Event): Promise<void> {
  const todo = event.data;
  const ctx = {
    log: logger,
    accountId: todo.accountId,
  };
  const connection = await connectionManager.findOne({
    ctx,
    provider: Provider.TODO_IST,
  });

  const todoIstProvider = providerManager.build(
    Provider.TODO_IST,
    connection.token,
  );

  switch (event.type) {
    case EventType.Create: {
      const { id, syncToken } = await todoIstProvider.create({
        ctx: {
          syncToken: connection.syncToken,
        },
        todo: {
          id: String(todo.id),
          name: todo.name,
          completed: todo.completed,
          createdAt: todo.createdAt,
        },
      });

      /*
       * Not updating the sync token here
       * as we would need to process all updates everytime we updated an item
       * there is a cron job running and processing all updates
       * 
        connection.syncToken = syncToken;
        await connectionManager.update({ ctx, connection });
      */

      await todoLinksManager.create({
        ctx,
        todoLink: {
          acccountId: ctx.accountId,
          connectionId: connection.id,
          todoId: todo.id,
          providerId: id,
        },
      });
      break;
    }

    case EventType.Update: {
      const link = await todoLinksManager.findOne({
        ctx,
        connectionId: connection.id,
        todoId: todo.id,
      });

      const { syncToken } = await todoIstProvider.update({
        ctx: {
          syncToken: connection.syncToken,
        },
        id: link.providerId,
        todo: {
          id: link.providerId,
          name: todo.name,
          completed: todo.completed,
          createdAt: todo.createdAt,
        },
      });

      /*
       * Not updating the sync token here
       * as we would need to process all updates everytime we updated an item
       * there is a cron job running and processing all updates
       * 
        connection.syncToken = syncToken;
        await connectionManager.update({ ctx, connection });
      */
      break;
    }

    case EventType.Complete: {
      const link = await todoLinksManager.findOne({
        ctx,
        connectionId: connection.id,
        todoId: todo.id,
      });

      const { syncToken } = await todoIstProvider.complete({
        ctx: {
          syncToken: connection.syncToken,
        },
        id: link.providerId,
        todo: {
          id: link.providerId,
          name: todo.name,
          completed: todo.completed,
          createdAt: todo.createdAt,
        },
      });

      /*
       * Not updating the sync token here
       * as we would need to process all updates everytime we updated an item
       * there is a cron job running and processing all updates
       * 
        connection.syncToken = syncToken;
        await connectionManager.update({ ctx, connection });
      */
      break;
    }

    default:
  }
}
