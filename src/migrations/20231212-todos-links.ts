import { Knex } from 'knex';
import { TODOS_LINKS_TABLE } from '../repositories/todos-links-repository';

export function up(knex: Knex) {
  return knex.schema.createTable(TODOS_LINKS_TABLE, function (table) {
    table.increments('id').primary();
    table.integer('account_id').unsigned().notNullable();
    table.integer('connection_id').unsigned().notNullable();
    table.string('provider').notNullable();
    table.string('todo_id').notNullable();
    table.string('provider_id').notNullable();
  });
}

export function down(knex: Knex) {
  return knex.schema.dropTable(TODOS_LINKS_TABLE);
}
