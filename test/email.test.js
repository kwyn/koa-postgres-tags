// Dependencies
var expect = require('chai').expect;
var app = require('./../index');
var request = require('supertest').agent(app.listen());
var config = require('./../config.js')
var knex = require('knex')(config.database);
var seedDatabase = require('./../seeds/knex-test.seed.js').seed;

describe('/emails', function (){
  beforeEach(function(done){
    seedDatabase()
      .then(function(result){
        done();
      })
      .catch(function(err){
        console.log(err);
      })
  });
  describe('GET', function (){
    describe('with valid e-mail that has tags', function (){
      it('should return body with e-mail string and tags array',function (done){
        request.get('/email/tagged@test.com')
          .expect(200, function(res){
            expect(typeof res.body.email).to.be('string');
            done();
          })
      });
      it('should return body with tags array with appropriate keys',function (done){
        request.get('/email/tagged@test.com')
          .expect(200, function(res){
            expect(Array.isArray(res.body.tags)).to.be.true();
            expect(res.body.tags).to.include('tag1');
            expect(res.body.tags).to.include('tag1');
            done();
          });
      });
    });
    describe('with valid e-mail that does not have tags', function (){
      it('should return body with e-mail string',function (done){
        request.get('/email/tagged@test.com')
          .expect(200, function(res){
            expect(typeof res.body.email).to.be('string');
            done();
          })
      });
      it('should return body with and empty tags array',function (done){
        request.get('/email/tagged@test.com')
          .expect(200, function(res){
            expect(Array.isArray(res.body.tags)).to.be.true();
            expect(res.body.tags.length).to.be(0);
            done();
          });
      });
    });
    describe('with invalid e-mail', function (){
      it('should return an 400 error with message', function (done) {
        request.get('/email')
          .expect(400)
          .end(done);
      });
    });
  });

  xdescribe('POST', function(){
    describe('with valid e-mail', function (){
      it('should return a 201', function (done){

      });
      it('should create record on email table', function (done){

      });
    });
    describe('with valid e-mail and 1 tag', function(){
      it('should return a 201', function (done){

      });
      it('should create record on tag table', function (done){

      });
      it('should create record on join table', function (done){

      });
    });
    describe('with valid e-mail and multiple tags', function(){
      it('should return a 201', function (done){

      });
      it('should create record on tag table', function (done){

      });
      it('should create record on join table', function (done){

      });
    })
    describe('with invalid e-mail', function (){
      it('should return an error with message', function (done) {
        request.get('/')
          .expect(501)
          .end(done);
      });
    });
    describe('with existing email address', function (){
      it('should return with resource updated status code', function (done){

      });
    });
  });

  xdescribe('DELETE', function(){
    describe('with valid e-mail', function(){
      it('should remove e-mail record from e-mail table', function(){

      });
      it('should remove records in join table.', function(){

      });
      it('should remove records in join table.', function(){

      });
    });
    describe('with invalid e-mail', function(){
      it('should return an error with message', function (done){

      });
    });
    describe('with non-existent e-mail', function(){
      it('should return an error with message', function (done){

      });
    });
  });

});
