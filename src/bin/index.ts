import { createApp } from '../app';
import { databaseConfig } from '../constants';
import { logger } from '../logger';

const port = process.env.PORT || 3000;

async function init() {
  const app = await createApp(databaseConfig);

  app.listen(port, () => {
    logger.info(`[server]: Server is running at http://localhost:${port}`);
  });
}

init().catch((e) => logger.error(`Init failed: ${e}`));
