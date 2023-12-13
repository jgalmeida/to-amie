import { CronJob } from 'cron';

import * as connectionManager from '../managers/connections-manager';
import * as syncManager from '../managers/sync-manager';
import { logger } from '../logger';

export function initCronJobs() {
  return [
    new CronJob(
      '*/10 * * * * *',
      async function () {
        try {
          /*
           * This won't scale like this, we need to do some batching to avoid
           * overload the server.
           * Queuing is also an option to control the rate at which we process data
           */
          const connectionsToSync =
            await connectionManager.findConnectionsReadyToSync();

          logger.info(
            `Starting sync for ${connectionsToSync.length} connections`,
          );

          for (const connection of connectionsToSync) {
            await syncManager.inboundSync({
              ctx: {
                accountId: connection.accountId,
                log: logger,
              },
              connection,
              currentSyncToken: connection.syncToken,
            });

            await connectionManager.readyToSync({
              ctx: {
                log: logger,
                accountId: connection.accountId,
              },
              connection,
            });
          }

          logger.info(
            `Finished sync for ${connectionsToSync.length} connections`,
          );
        } catch (e) {
          logger.error(e);
        }
      },
      null,
      true,
    ),
  ];
}
