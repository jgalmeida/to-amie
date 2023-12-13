import { Connection } from '../entities/connection';
import * as connectionsRepository from '../repositories/connections-repository';

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
