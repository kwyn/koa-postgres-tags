var Promise = require('bluebird');
var _ = require('lodash');

module.exports = {
  getTags: function(email, knex){
    return knex('emails')
            .where('email', email)
            .first('email_id')
            .then(function(result){
              return knex('tag_map')
                      .where('email_id', result.email_id)
                      .select('tag_id');
            })
            .then(function(result){
              var ids = _.pluck(result, 'tag_id');
              return knex('tags')
                      .whereIn('tag_id', ids)
                      .select('tag_name');
            })
            .then(function(results){
              return _.pluck(results,'tag_name');
            })
            .catch(function(error){
              console.error('getTags error', error);
            });
    }
, insertEmail: function(email, knex){
    // Insert the email
    return knex('emails')
      // return email_id once inserted
      .returning('email_id')
      .insert({email: email});
    }
, insertTags: function(tags, email_id, knex){
    var insert_tags = tags.map(function(tag){
      return knex('tags')
              .returning('tag_id')
              .insert({'tag_name': tag});
    });
    // Wait for promises to settle
    return Promise.settle(insert_tags)
      // Create tag_map records for e-mail
      .map(function(promise){
        // If a promise gets rejected return it to be handled by catch function
        if(promise.isRejected()){
          return promise;
        }
        var tag_id = promise.value();
        return knex('tag_map').insert({tag_id: tag_id[0], email_id: email_id[0]});
      })
      .then(function(){
        return tags;
      })
      .catch(function(error){
        console.error('insertTags', error);
      });
    }
, getEmails: function(tags, knex){
    return knex('tags')
            .whereIn('tag_name',tags)
            .select('tag_id')
            .then(function(results){
              tag_ids = _.pluck(results, 'tag_id');
              // Look up and return email ids
              return knex('tag_map').whereIn('tag_id', tag_ids).select('email_id')
            })
            .then(function(results){
              email_ids = _.unique(_.pluck(results, 'email_id'));
              return knex('emails').whereIn('email_id', email_ids).select('email');
            })
            .then(function(results){
              return _.pluck(results, 'email');
            })
  }
}
