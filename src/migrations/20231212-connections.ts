import { Knex } from 'knex';

import { CONNECTIONS_TABLE } from '../repositories/connections-repository';

export function up(knex: Knex) {
  return knex.schema.createTable(CONNECTIONS_TABLE, function (table) {
    table.increments('id').primary();
    table.string('account_id').notNullable();
    table.string('provider').notNullable();
    table.string('status').notNullable();
    table.string('token').notNullable();
    table.string('sync_token');
    table.string('sync_token_expires_at');
    table.dateTime('updated_at').notNullable();
  });
}

export function down(knex: Knex) {
  return knex.schema.dropTable(CONNECTIONS_TABLE);
}
