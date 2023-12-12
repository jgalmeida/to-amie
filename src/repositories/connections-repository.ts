import { mysqlDateTime, withinConnection } from '../adapters/mysql';
import { Context } from '../entities/context';
import {
  Connection,
  ConnectionRow,
  NewConnection,
  Status,
} from '../entities/connection';
import { isDefined } from '../tools/is';
import { Provider } from '../entities/provider';

export const CONNECTIONS_TABLE = 'connections';

interface FindMany {
  ctx: Context;
  accountId: string;
  provider: Provider;
  updatedAt?: Date;
}
export async function findMany({
  ctx,
  accountId,
  provider,
  updatedAt,
}: FindMany): Promise<Connection[]> {
  return withinConnection({
    callback: async (conn) => {
      const connectionsRows = await conn
        .table(CONNECTIONS_TABLE)
        .where((builder) => {
          builder.where({ account_id: accountId });
          builder.where({ provider });
          isDefined(updatedAt, () => builder.where({ updated_at: updatedAt }));
        });

      return connectionsRows.map(reverseTransform);
    },
  });
}

interface CreateArgs {
  ctx: Context;
  newConnection: Omit<NewConnection, 'id'>;
}
export async function create({
  newConnection,
}: CreateArgs): Promise<Connection> {
  return withinConnection({
    callback: async (conn) => {
      const ids = await conn
        .table(CONNECTIONS_TABLE)
        .insert(transform(newConnection as Connection)); // Insert doesn't have ID

      return {
        id: ids[0],
        ...newConnection,
      };
    },
  });
}

export function transform(connection: Connection): ConnectionRow {
  return {
    id: connection.id,
    account_id: connection.accountId,
    provider: connection.provider,
    status: connection.status,
    token: connection.token,
    sync_token: connection.syncToken,
    sync_token_expires_at: connection.syncTokenExpiresAt
      ? mysqlDateTime(connection.syncTokenExpiresAt)
      : null,
    updated_at: mysqlDateTime(connection.updatedAt),
  };
}

export function reverseTransform(connectionRow: ConnectionRow): Connection {
  return {
    id: connectionRow.id,
    accountId: connectionRow.account_id,
    provider: connectionRow.provider as Provider,
    status: connectionRow.status as Status,
    token: connectionRow.token,
    syncToken: connectionRow.sync_token,
    syncTokenExpiresAt: new Date(connectionRow.sync_token_expires_at),
    updatedAt: new Date(connectionRow.updated_at),
  };
}
