import { Connection, Status } from '../entities/connection';
import { Context } from '../entities/context';
import { logger } from '../logger';
import * as connectionsRepository from '../repositories/connections-repository';

export async function findConnectionsReadyToSync(): Promise<Connection[]> {
  return connectionsRepository.findMany({
    ctx: {
      log: logger,
    } as Context,
    status: Status.Ready,
    lock: true,
  });
}

export async function findOne(
  args: connectionsRepository.FindManyArgs,
): Promise<Connection> {
  const [connection] = await connectionsRepository.findMany(args);

  if (!connection) {
    throw new Error('Connection not found');
  }

  return connection;
}

export async function create({
  ctx,
  newConnection,
}: connectionsRepository.CreateArgs): Promise<Connection> {
  return connectionsRepository.create({
    ctx,
    newConnection,
  });
}

export async function update({
  ctx,
  connection,
}: connectionsRepository.UpdateArgs): Promise<void> {
  return connectionsRepository.update({
    ctx,
    connection,
  });
}

export async function readyToSync({
  ctx,
  connection,
}: connectionsRepository.UpdateArgs): Promise<void> {
  connection.status = Status.Ready;
  return connectionsRepository.update({
    ctx,
    connection,
  });
}
