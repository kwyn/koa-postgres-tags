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
var db = require('./database');
// Router
var public = router();

public.get('/', function*(){
  this.body = 'email tagging api, send me some data, or ask me a question';
});

var Joi_validate = co.wrap(Joi.validate);
var email_schema = Joi.string().lowercase().email();

public.get('/emails', function* (next){
  if(!this.query){
    this.status = 400;
    this.body = {
      error: 'Requires tags query string with an array of tags'
    }
    return;
  }
  // This imposes a constraint on tags that they must not contain commas
  var tags = this.query.tags.split(',');
  console.log(tags);
  var emails = yield db.getEmails(tags, this.knex);
  this.body = {
    emails: emails
  }
  this.status = 200;
  return;
});

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
  var tags = yield db.getTags(email, this.knex);
  var data = {
    email: email,
    tags: tags
  };
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
    var email_id = yield db.insertEmail(body.email,  this.knex);
    // Create default tags
    var tags = [];
    // If tags were given, insert tags
    if(body.tags){
      tags = yield db.insertTags(body.tags, email_id, this.knex);
    }
    // Respond with email and tags
    this.body = {
      email: body.email,
      tags: tags
    };
    this.status = 201;
    return;
  }
})


var app = koa();
app.use(knex(config.database));
app.use(public.middleware());
module.exports = app;

