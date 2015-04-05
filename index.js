// Load environmental variables
var dotenv = require('dotenv');
dotenv.load();

// Dependencies
var koa = require('koa');
var router = require('koa-joi-router');
var Joi = require('joi');
var knex = require('knex-pg-middleware');
var config = require('./config');
var co = require('co');
var _ = require('lodash');
var Promise = require('bluebird');

// Router
var public = router();

public.get('/', function*(){
  this.body = 'email tagging api, send me some data, or ask me a question';
});

var Joi_validate = co.wrap(Joi.validate);
var email_schema = Joi.string().lowercase().email();

public.get('/emails/:email', function* (next){
  // Validate with Joi that it is an e-mail
  var valid = yield Joi_validate(this.params.email, email_schema);
  if(valid.error){
    // Respond with invalid request
    this.status = 400;
    this.body = {
      error: valid.error.details
    }
    yield next;
    return;
  }
  var email = valid.value;

  function getTags(email, knex){
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
            .catch(function(error){
              console.error('getTags error', error);
            });
  }

  var tags = yield getTags(email, this.knex);
  var data = {
    email: email,
    tags: _.pluck(tags, 'tag_name')
  };
  // If tags. data.tags = return tags
  this.body = data;
  return;
});

public.route({
  method: 'post'
, path: '/emails'
, validate: {
    body: {
      email: Joi.string().lowercase().email()
    , tags: Joi.array()
    }
  , type: 'json'
  }
, handler: function*(){
    var body = this.request.body;
    // Insert email and get id
    var email_id = yield insertEmail(body.email,  this.knex);
    // Create default tags
    var tags = [];
    // If tags were given, insert tags
    if(body.tags){
      tags = yield insertTags(body.tags, this.knex);
    }
    this.body = {
      email: body.email,
      tags: tags
    };
    this.status = 201;
    return;

    function insertEmail(email, knex){
      // Insert the email
      return knex('emails')
        // return email_id once inserted
        .returning('email_id')
        .insert({email: email});
    }
    function insertTags(tags, knex){
            var insert_tags = tags.map(function(tag){
              return knex('tags')
                      .returning('tag_id')
                      .insert({'tag_name': tag});
            });
            // Wait for promises to settle
            return Promise.settle(insert_tags)
              // Create tag_map records for e-mail
              .map(function(promise){
                // If a promise fails return it to be handled by catch function
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
    };
  }
})

public.get('/tags/:tag', function*(){

});


var app = koa();
app.use(knex(config.database));
app.use(public.middleware());
module.exports = app;

