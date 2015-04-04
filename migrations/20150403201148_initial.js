'use strict';

exports.up = function(knex, Promise) {
  return knex.schema
    // Create emails table
    .createTable('emails', function (table) {
      table.increments('email_id').primary();
      table.string('email').unique();
      table.timestamps();
    })
    // Create tags table
    .createTable('tags', function (table){
      table.increments('tag_id').primary();
      table.string('tag_name').unique();
    })
    // Create join table for tags and emails
    .createTable('tag_map', function (table){
      table.increments().primary();
      table.integer('email_id')
        .unsigned()
        .references('email_id')
        // .inTable('emails.id');
      table.integer('tag_id')
        .unsigned()
        .references('tag_id')
        // .inTable('tags');
    });
};

exports.down = function(knex, Promise) {
  return knex.schema
          .dropTable('tag_map')
          .dropTable('emails')
          .dropTable('tags')
};
