import { Context } from '../entities/context';
import * as providerManager from './providers';
import * as connectionManager from './connections-manager';

interface SyncArgs {
  ctx: Context;
  connectionId: number;
}

export async function startSync({
  ctx,
  connectionId,
}: SyncArgs): Promise<boolean> {
  await inboundSync({ ctx, connectionId });
  //await outboundSync({ ctx, connectionId });
  //await keepSyncing({ ctx, connectionId });

  return true;
}

async function inboundSync({ ctx, connectionId }: SyncArgs) {
  const connection = await connectionManager.findOne({ ctx, id: connectionId });
  const provider = providerManager.build(connection.provider, connection.token);

  const resp = await provider.findMany({ syncToken: connection.syncToken });

  connection.syncToken = resp.syncToken;
  await connectionManager.update({ ctx, connection });
}

async function outboundSync({ ctx, connectionId }: SyncArgs) {
  const connection = await connectionManager.findOne({ ctx, id: connectionId });
  const provider = providerManager.build(connection.provider, connection.token);

  const resp = await provider.findMany({ syncToken: connection.syncToken });

  connection.syncToken = resp.syncToken;
  await connectionManager.update({ ctx, connection });
}

async function keepSyncing({ ctx, connectionId }: SyncArgs) {
  const connection = await connectionManager.findOne({ ctx, id: connectionId });
  const provider = providerManager.build(connection.provider, connection.token);

  const resp = await provider.findMany({ syncToken: connection.syncToken });

  connection.syncToken = resp.syncToken;
  await connectionManager.update({ ctx, connection });
}
