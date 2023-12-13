import { Knex } from 'knex';

import { CONNECTIONS_TABLE } from '../repositories/connections-repository';

export function up(knex: Knex) {
  return knex.schema.createTable(CONNECTIONS_TABLE, function (table) {
    table.increments('id').primary();
    table.integer('account_id').unsigned().notNullable();
    table.string('provider').notNullable();
    table.string('status').notNullable();
    table.string('token').notNullable();
    table.string('sync_token');
    table.dateTime('updated_at').notNullable();
  });
}

export function down(knex: Knex) {
  return knex.schema.dropTable(CONNECTIONS_TABLE);
}
