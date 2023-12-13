import { Knex } from 'knex';
import { LISTS_TABLE } from '../repositories/list-repository';
import { TODOS_TABLE } from '../repositories/todos-repository';

export function up(knex: Knex) {
  return knex.schema
    .createTable(LISTS_TABLE, function (table) {
      table.increments('id').primary();
      table.integer('account_id').unsigned().notNullable();
      table.string('name').notNullable();
      table.dateTime('created_at').notNullable();

      table.unique('name');
    })
    .createTable(TODOS_TABLE, function (table) {
      table.increments('id').primary();
      table.integer('account_id').unsigned().notNullable();
      table.string('name').notNullable();
      table.boolean('completed').notNullable();
      table.integer('list_id').unsigned().notNullable();
      table.dateTime('created_at').notNullable();

      table.index('created_at');
    });
}

export function down(knex: Knex) {
  return knex.schema.dropTable(LISTS_TABLE).dropTable(TODOS_TABLE);
}
