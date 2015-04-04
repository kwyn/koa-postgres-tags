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
  console.log(valid.error);
  if(valid.error){
    console.log('test')
    // Respond with invalid request
    this.status = 400;
    this.body = {
      error: valid.error.details
    }
    yield next;
    return;
  }
  var email = valid.value;

  var tags = yield this.knex('emails').where('email', email);
  var data = {
    email: valid.value,
    tags: tags
  };
  // TODO: Look up through join table for tags.
  // If tags. data.tags = return tags
  this.body = data;
  //
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

