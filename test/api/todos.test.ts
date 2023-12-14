import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { SuperTest, Test } from 'supertest';

import { startApp, stopApp } from '../app';

import { truncateTables } from '../tools/mysql';

let app: SuperTest<Test>;

/*
 * Just an example of how a test would look like
 */
describe('Todos', () => {
  jest.setTimeout(60000);

  beforeAll(async () => {
    app = await startApp();
  });

  afterAll(async () => {
    await stopApp();
  });

  describe('Create TODO', () => {
    beforeEach(async () => {
      await truncateTables();
    });

    it('should pass', () => {
      expect(1).toBe;
    });
  });
});
