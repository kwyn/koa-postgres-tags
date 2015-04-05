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
            });
  }

  var tags = yield getTags(email, this.knex);
  var data = {
    email: email,
    tags: _.pluck(tags, 'tag_name')
  };
  // TODO: Look up through join table for tags.
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
    , password: Joi.string().max(100)
    , tags: Joi.array()
    }
  , type: 'json'
  }
, handler: function*(){
    this.req.body
    var email = yield this.knex('email').where('email', email)
    this.status = 201;
  }
});

public.get('/tags/:tag', function*(){

});


var app = koa();
app.use(knex(config.database));
app.use(public.middleware());
module.exports = app;

