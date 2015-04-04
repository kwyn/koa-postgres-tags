'use strict';

exports.up = function(knex, Promise) {
  return Promise.join(
    // Create emails table
    knex.schema.createTable('emails', function (table) {
      table.increments('id').primary();
      table.string('email');
      table.timestamps();
    }),

    // Create tags table
    knex.schema.createTable('tags', function (table){
      table.increments('id').primary();
      table.string('tag_name');
    }),
    // Create join table for tags and emails
    knex.schema.createTable('tag_map', function (table){
      table.increments().primary();
      table.integer('email_id')
        .unsigned()
        .references('id')
        .inTable('emails');
      table.integer('tag_id')
        .unsigned()
        .references('id')
        .inTable('tags');
    })
  );
};

exports.down = function(knex, Promise) {
  return Promise.join(
    // knex.raw('SET foreign_key_checks = 0;'),
    knex.schema.dropTable('tag_map'),
    knex.schema.dropTable('emails'),
    knex.schema.dropTable('tags')
    // knex.raw('SET foreign_key_checks = 1;')
  );
};
