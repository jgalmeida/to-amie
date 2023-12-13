import { Context } from '../entities/context';
import * as providerManager from './providers';
import * as connectionManager from './connections-manager';
import * as todoManager from './todo-manager';
import * as todoLinksManager from './todo-links-manager';
import { Connection, Status } from '../entities/connection';
import { Paginated } from '../entities/common';
import { Todo } from '../entities/todo';

interface StartSyncArgs {
  ctx: Context;
  connectionId: number;
}

interface SyncArgs {
  ctx: Context;
  connection: Connection;
  currentSyncToken?: string;
}
/*
 *
 * If the process crashes in the middle of the initial sync, it needs to start from scratch
 * Ideally after each page is processed, the state would be saved to be resumed
 *
 *
 * We would also need to rate limit when calling the provider, queuing can be used for that
 */
export async function startSync({
  ctx,
  connectionId,
}: StartSyncArgs): Promise<boolean> {
  const connection = await connectionManager.findOne({ ctx, id: connectionId });
  connection.status = Status.Warming;
  await connectionManager.update({ ctx, connection });

  ctx.log.info('[Inbound sync] - Start');
  await inboundSync({ ctx, connection });
  ctx.log.info('[Inbound sync] - Finish');

  ctx.log.info('[Outbound sync] - Start');
  await outboundSync({ ctx, connection });
  ctx.log.info('[Outbound sync] - Finish');

  ctx.log.info('[Incremental sync] - Start');
  await keepSyncing({ ctx, connection });

  return true;
}

export async function inboundSync({
  ctx,
  connection,
  currentSyncToken = undefined,
}: SyncArgs) {
  const provider = providerManager.build(connection.provider, connection.token);

  const { todos, syncToken } = await provider.findMany({
    syncToken: currentSyncToken,
  });

  /*   connection.syncToken = syncToken;
  await connectionManager.update({ ctx, connection });

  return; */

  const localPromisses = [];

  for (const providerTodo of todos) {
    localPromisses.push(
      new Promise(async (resolve, reject) => {
        try {
          const link = await todoLinksManager.findOne({
            ctx,
            connectionId: connection.id,
            providerId: providerTodo.id,
          });

          if (link) {
            ctx.log.warn('Todo link already exists...skipping');
            resolve(true);
            return;
          }

          // This could be done in bulk
          const todo = await todoManager.create({
            ctx,
            todo: {
              accountId: connection.accountId,
              listId: 1,
              name: providerTodo.name,
            },
          });

          // This could be done in bulk
          await todoLinksManager.create({
            ctx,
            todoLink: {
              acccountId: connection.accountId,
              connectionId: connection.id,
              todoId: todo.id,
              providerId: providerTodo.id,
            },
          });

          resolve(true);
        } catch (e) {
          reject(e);
        }
      }),
    );
  }

  await Promise.all(localPromisses);

  connection.syncToken = syncToken;
  await connectionManager.update({ ctx, connection });
}

export async function outboundSync({ ctx, connection }: SyncArgs) {
  const provider = providerManager.build(connection.provider, connection.token);

  let promises = [];
  let paginatedTodos: Paginated<Todo[]> = {
    hasMore: true,
    after: 0,
    data: [],
  };

  do {
    paginatedTodos = await todoManager.findMany({
      ctx,
      limit: 100,
    });

    if (!paginatedTodos.data.length) {
      return;
    }

    for (const todo of paginatedTodos.data) {
      promises.push(
        new Promise(async (resolve, reject) => {
          try {
            const link = await todoLinksManager.findOne({
              ctx,
              connectionId: connection.id,
              todoId: todo.id,
            });

            if (link) {
              ctx.log.warn('Todo link already exists...skipping');
              resolve(true);
              return;
            }

            // This could be done in bulk using the provider sync api
            const providerResponse = await provider.create({
              ctx: {
                syncToken: connection.syncToken,
              },
              todo: {
                name: todo.name,
                completed: todo.completed,
                createdAt: todo.createdAt,
              },
            });

            // This could be done in bulk
            await todoLinksManager.create({
              ctx,
              todoLink: {
                acccountId: connection.accountId,
                connectionId: connection.id,
                todoId: todo.id,
                providerId: providerResponse.id,
              },
            });

            connection.syncToken = providerResponse.syncToken;
            await connectionManager.update({ ctx, connection });

            resolve(true);
          } catch (e) {
            reject(e);
          }
        }),
      );
    }

    await Promise.all(promises);
  } while (paginatedTodos.hasMore);
}

export async function keepSyncing({ ctx, connection }: SyncArgs) {
  /*
   * There is a job taking syncing all connection in syncing state
   */
  connection.status = Status.Ready;
  await connectionManager.update({ ctx, connection });
}
