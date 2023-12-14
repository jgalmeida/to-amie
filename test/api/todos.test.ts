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

describe('TODOS', () => {
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

    it('should test', () => {
      expect(1).toBe;
    });
  });
});
