import { Context } from '../entities/context';
import * as providerManager from './providers';
import * as connectionManager from './connections-manager';
import * as todoManager from './todo-manager';
import * as todoLinksManager from './todo-links-manager';
import { Connection, Status } from '../entities/connection';

interface StartSyncArgs {
  ctx: Context;
  connectionId: number;
}

interface SyncArgs {
  ctx: Context;
  connection: Connection;
}

export async function startSync({
  ctx,
  connectionId,
}: StartSyncArgs): Promise<boolean> {
  const connection = await connectionManager.findOne({ ctx, id: connectionId });
  connection.status = Status.Warming;
  await connectionManager.update({ ctx, connection });

  await inboundSync({ ctx, connection });
  await outboundSync({ ctx, connection });
  await keepSyncing({ ctx, connection });

  return true;
}

async function inboundSync({ ctx, connection }: SyncArgs) {
  const provider = providerManager.build(connection.provider, connection.token);

  const resp = await provider.findMany({ syncToken: connection.syncToken });

  connection.syncToken = resp.syncToken;
  await connectionManager.update({ ctx, connection });
}

async function outboundSync({ ctx, connection }: SyncArgs) {
  const provider = providerManager.build(connection.provider, connection.token);

  const resp = await provider.findMany({ syncToken: connection.syncToken });

  connection.syncToken = resp.syncToken;
  await connectionManager.update({ ctx, connection });
}

async function keepSyncing({ ctx, connection }: SyncArgs) {
  /*
   * There is a job taking syncing all connection in syncing state
   */
  connection.status = Status.Syncing;
  await connectionManager.update({ ctx, connection });
}
