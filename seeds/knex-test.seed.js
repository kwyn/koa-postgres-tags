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
        )
        .then(Promise.join(
            // Inserts seed entries
            // insert test emails
            knex('emails').insert({email_id: 1, email: 'tagged@test.com'}),
            knex('emails').insert({email_id: 2, email: 'untagged@test.com'}),
            // Insert tags
            knex('tags').insert({tag_id: 1, tag_name: 'tag1'}),
            knex('tags').insert({tag_id: 2, tag_name: 'tag2'})
        ))
        .then(Promise.join(
            // Map tags to tagged
            knex('tag_map').insert({id: 1, email_id: 1, tag_id: 1}),
            knex('tag_map').insert({id: 2, email_id: 1, tag_id: 2})
        )).catch(function(error){
            console.error('knex test seed', error)
        });
};
