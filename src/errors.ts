import { createError } from '@fastify/error';

export const ERR_DATABASE = createError(
  'ERR_DATABASE',
  'Failed to perform at database level',
  500,
);

export const ERR_DUPLICATE = createError(
  'ERR_DUPLICATE',
  'Entity already exists',
  400,
);

export const ERR_NOT_FOUND = createError(
  'ERR_NOT_FOUND',
  'Requested resource not found',
  404,
);
