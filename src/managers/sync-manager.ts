import { Context } from '../entities/context';
import * as providerManager from './providers';
import * as connectionManager from './connections-manager';
import * as todoManager from './todo-manager';
import * as todoLinksManager from './todo-links-manager';
import { Connection, Status } from '../entities/connection';
import { Paginated } from '../entities/common';
import { Todo } from '../entities/todo';
import { DEFAULT_LIST_ID } from '../constants';

interface StartSyncArgs {
  ctx: Context;
  connectionId: number;
}

interface SyncArgs {
  ctx: Context;
  connection: Connection;
  currentSyncToken?: string;
}

const inboundCreatedIds: Record<string, Record<string, boolean>> = {};
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

  inboundCreatedIds[connection.accountId] = {};

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

export async function inboundSync({ ctx, connection }: SyncArgs) {
  const provider = providerManager.build(connection.provider, connection.token);

  const { todos, syncToken } = await provider.findMany({
    syncToken: undefined,
  });

  const localPromisses = [];

  for (const providerTodo of todos) {
    /*
     * Won't sync completed or deleted todos during the fist inbound sync
     */
    if (providerTodo.completed || providerTodo.isDeleted) {
      continue;
    }

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
              listId: DEFAULT_LIST_ID,
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

          inboundCreatedIds[connection.accountId][todo.id] = true;

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
      /*
       * Skip sending todos created during the first inbound sync
       */
      if (inboundCreatedIds[connection.accountId][todo.id]) {
        continue;
      }

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
                isDeleted: false,
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

interface IncrementalSyncArgs {
  ctx: Context;
  connection: Connection;
  currentSyncToken: string;
}
export async function incrementalSync({
  ctx,
  connection,
  currentSyncToken,
}: IncrementalSyncArgs) {
  const provider = providerManager.build(connection.provider, connection.token);

  const { todos, syncToken } = await provider.findMany({
    syncToken: currentSyncToken,
  });

  ctx.log.info(`Syncing ${todos.length} for account ${connection.accountId}`);

  const localPromisses = [];

  for (const providerTodo of todos) {
    /*
     * Won't sync deleted todos
     */
    if (providerTodo.isDeleted) {
      continue;
    }

    localPromisses.push(
      new Promise(async (resolve, reject) => {
        try {
          const link = await todoLinksManager.findOne({
            ctx,
            connectionId: connection.id,
            providerId: providerTodo.id,
          });

          /*
           * Update or Create locally
           */
          if (link) {
            const localTodo = await todoManager.findOne({
              ctx,
              id: link.todoId,
            });

            if (
              localTodo.name !== providerTodo.name ||
              localTodo.completed !== providerTodo.completed
            ) {
              await todoManager.update({
                ctx,
                id: localTodo.id,
                name: providerTodo.name,
                completed: providerTodo.completed,
              });
            }
          } else {
            // This could be done in bulk
            const todo = await todoManager.create({
              ctx,
              todo: {
                accountId: connection.accountId,
                listId: DEFAULT_LIST_ID,
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
          }
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
