import { Context, Next } from 'koa';
import { sleep } from '../tools/sleep';
import { logger } from '../logger';

type Signal = {
  name: NodeJS.Signals;
  code: number;
};

const EXIT_SIGNALS: Signal[] = [
  { name: 'SIGTERM', code: 15 },
  { name: 'SIGINT', code: 2 },
  { name: 'SIGUSR2', code: 12 },
];

enum LifeCycleState {
  Running,
  ExitSignalReceived,
  ShuttingDown,
}

const EXIT_TIMEOUT = 1000;

export function lifecycle() {
  let state = LifeCycleState.Running;

  async function shutdown(signal: Signal) {
    state = LifeCycleState.ExitSignalReceived;

    logger.info(`Service received ${signal.name}, starting graceful shutdown`);

    state = LifeCycleState.ShuttingDown;

    await sleep(EXIT_TIMEOUT);

    process.exit(signal.code);
  }

  for (const signal of EXIT_SIGNALS) {
    process.once(signal.name, () => shutdown(signal));
  }

  process.on('unhandledRejection', async (reason) => {
    logger.error('Unhandled rejection, exiting', reason);

    await sleep(EXIT_TIMEOUT);

    process.exit(1);
  });

  process.on('unhandledException', async (reason) => {
    logger.error('Unhandled exception, exiting', reason);

    await sleep(EXIT_TIMEOUT);

    process.exit(1);
  });

  return async (ctx: Context, next: Next) => {
    if (state === LifeCycleState.ShuttingDown) {
      logger.warn(
        'Service still requested even though shutdown is in progress',
      );

      ctx.status = 503;
      ctx.body = 'Server is shutting down';

      return;
    }

    await next();
  };
}
