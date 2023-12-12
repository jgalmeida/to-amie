import got, { RequestError, OptionsOfJSONResponseBody } from 'got';
import { logger } from '../logger';

export async function request<T>(
  options: OptionsOfJSONResponseBody,
): Promise<T> {
  try {
    const response = await got(options).json();

    return response as T;
  } catch (e) {
    if (e instanceof RequestError) {
      logger.error('Error generating access token', e.response?.body);
    }

    throw e;
  }
}
