import { FastifyError } from '@fastify/error';
import { STATUS_CODES } from 'http';
import { ReqId } from 'pino-http';
import { Context, Next } from 'koa';

import { env } from '../constants';
import { logger } from '../logger';

type ErrorPayload = {
  cid: ReqId;
  error?: string;
  code: string;
  message: string;
  statusCode: number;
  meta?: any;
};

type ErrorMeta = {
  message: string;
  path: string;
};

function errorPayload(
  code: string,
  cid: ReqId,
  message: string,
  statusCode = 500,
  meta?: any,
): ErrorPayload {
  return {
    cid,
    error: STATUS_CODES[statusCode],
    code,
    message,
    statusCode,
    meta,
  };
}

function isFastifyError(v: any): v is FastifyError {
  return (
    v.constructor.name === 'FastifyError' || v.code === 'FST_ERR_VALIDATION'
  );
}

export async function error(ctx: Context, next: Next) {
  try {
    await next();
  } catch (err) {
    const req = ctx.req;
    const res = ctx.res;
    if (!env.isTest) {
      logger.error({ cid: req.id, err });
    }

    if (res.headersSent) {
      return next();
    }

    const genericErrorMessage = `Internal Server Error (${req.id})`;

    let payload: ErrorPayload;

    if (isFastifyError(err)) {
      payload = errorPayload(
        err.code,
        req.id,
        err.statusCode && err.statusCode < 500
          ? err.message
          : genericErrorMessage,
        err.statusCode,
      );
    } else {
      payload =
        payload ||
        errorPayload('ERR_UNKNOWN', req.id, genericErrorMessage, 500);
    }

    ctx.status = payload.statusCode;
    ctx.header['content-type'] = 'application/json; charset=utf-8';
    ctx.body = payload;
  }
}
