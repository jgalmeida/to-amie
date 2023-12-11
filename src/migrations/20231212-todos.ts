import { Knex } from 'knex';
import { LISTS_TABLE } from '../repositories/list-repository';
import { TODOS_TABLE } from '../repositories/todo-repository';

export function up(knex: Knex) {
  return knex.schema
    .createTable(LISTS_TABLE, function (table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.dateTime('created_at').notNullable();

      table.unique('name');
    })
    .createTable(TODOS_TABLE, function (table) {
      table.increments('id').primary();
      table.string('name').notNullable();
      table.boolean('completed').notNullable();
      table.integer('list_id').unsigned().notNullable();
      table.dateTime('created_at').notNullable();

      table.unique(['name', 'list_id']);
      table.index('name');
      table.index('created_at');

      table
        .foreign('list_id')
        .references('id')
        .inTable(LISTS_TABLE)
        .onDelete('CASCADE');
    });
}

export function down(knex: Knex) {
  return knex.schema.dropTable(LISTS_TABLE).dropTable(TODOS_TABLE);
}
