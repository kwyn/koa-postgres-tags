var Promise = require('bluebird');
var config = require('./../config.js');
var knex = require('knex')(config.database);
// For testing
exports.seed = function() {
    return Promise.join(
        // Deletes ALL existing entries
        knex('tag_map').del(),
        knex('tags').del(),
        knex('emails').del()
        ).then(
        // Inserts seed entries
        // insert test emails
        knex.insert({id: 1, email: 'tagged@test.com'})
            .into('emails')
            .insert({id: 2, email: 'untagged@test.com'})
            .into('emails')
            // Insert tags
            .insert({id: 1, tag_name: 'tag1'})
            .into('tags')
            .insert({id: 2, tag_name: 'tag2'})
            .into('tags')
        // Map tags to tagged
            .insert({id: 1, email_id: 1, tag_id: 1})
            .into('tag_map')
            .insert({id: 2, email_id: 1, tag_id: 2})
            .into('tag_map')
        );
};
