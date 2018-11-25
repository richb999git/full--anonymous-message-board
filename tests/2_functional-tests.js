/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  var testID, testID2;

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      
      test('(Thread) Both fields filled in and return correct', function(done) {
         chai.request(server)
          .post('/api/threads/testboard')  ////////////////////////////////////////// project "testboard"
          .send({
            text: 'Test text1',
            delete_password: '321'
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body.text, "Test text1");
            assert.equal(res.body.delete_password, "321");
            assert.property(res.body, "created_on");
            assert.property(res.body, "bumped_on");
            assert.property(res.body, "reported");
            assert.property(res.body, "replies");
            testID = res.body._id;
            done();
          });
      });
      
      test('(Thread) Both fields filled in and return correct again', function(done) {
         chai.request(server)
          .post('/api/threads/testboard')  ////////////////////////////////////////// project "testboard"
          .send({
            text: 'Test text2',
            delete_password: '4321'
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body.text, "Test text2");
            assert.equal(res.body.delete_password, "4321");
            assert.property(res.body, "created_on");
            assert.property(res.body, "bumped_on");
            assert.property(res.body, "reported");
            assert.property(res.body, "replies");
            testID2 = res.body._id;
            done();
          });
      });
      
      test('(Thread) No password given when posting a thread', function(done) {
         chai.request(server)
          .post('/api/threads/testboard')  ////////////////////////////////////////// project "testboard"
          .send({
            text: 'Test text2'
            
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "please enter a password");
            done();
          });
      });
      
      
      
    });
    
    suite('GET', function() {
      
      test('(Thread) Get top ten threads with 3 most recent replies', function(done) {
         chai.request(server)
          .get('/api/threads/testboard')  ////////////////////////////////////////// project "testboard"
          .send({
            
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            assert.property(res.body[0], 'text');
            assert.property(res.body[0], 'created_on');
            assert.property(res.body[0], 'bumped_on');
            assert.property(res.body[0], 'replies');
            assert.notProperty(res.body[0], 'delete_password');
            assert.notProperty(res.body[0], 'reported');
            assert.isArray(res.body[0].replies);
            assert.operator(res.body[0].replies.length, "<", 4, "replies set has a max size of 3");
            //assert.lengthOf(res.body, 10, 'set has size of 10');  // need to have at least 10 threads
            assert.operator(res.body.length, '<', 11, 'threads set has a max size of 10');
            done();
          });
      });
      
    });
    
    suite('DELETE', function() {
      
      test('(Thread) Attempt delete thread with incorrect password', function(done) { //
        chai.request(server)
          .delete('/api/threads/testboard')
          .send({ 
              thread_id: testID,
              delete_password: "wrong" 
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "incorrect password");
            done();
        });
      });
      
      test('(Thread) Attempt delete thread with correct password', function(done) { //
        chai.request(server)
          .delete('/api/threads/testboard')
          .send({ 
              thread_id: testID,
              delete_password: "321" 
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
        });
      });
      
    });
    
    suite('PUT', function() {
      
      test('(Thread) Report a thread with a invalid ID', function(done) { //
        chai.request(server)
          .put('/api/threads/testboard')
          .send({ 
              report_id: "ghkjsdfsu"
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "invalid ID");
            done();
        });
      });
      
      test('(Thread) Report a thread with a valid ID', function(done) { //
        chai.request(server)
          .put('/api/threads/testboard')
          .send({ 
              report_id: testID2
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
        });
      });
      
      test('(Thread) Report same thread with a valid ID', function(done) { //
        chai.request(server)
          .put('/api/threads/testboard')
          .send({ 
              report_id: testID2
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "could not update " + testID2);
            done();
        });
      });
      
    });
    

  });
  
  var testReplyID;
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      
      test('(Reply) All fields filled in and return correct', function(done) {
         chai.request(server)
          .post('/api/replies/testboard')  ////////////////////////////////////////// project "testboard" 
          .send({
            text: 'Reply text1',
            delete_password: '54321',
            thread_id: testID2
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body.replies);
            assert.property(res.body, "bumped_on");
            assert.equal(res.body.replies[0].text, "Reply text1");
            assert.equal(res.body.replies[0].delete_password, "54321");
            assert.equal(res.body.replies[0].reported, false);
            assert.property(res.body.replies[0], "created_on");
            testReplyID = res.body.replies[0]._id;
            done();
          });
      });
      
      test('(Reply) All fields filled in incorrectly', function(done) {
         chai.request(server)
          .post('/api/replies/testboard')  ////////////////////////////////////////// project "testboard" 
          .send({
            text: 'Reply text1',
            delete_password: '54321',
            thread_id: "wrongID"
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "could not find " + "wrongID");
            done();
          });
      });
      
    });
    
    suite('GET', function() {
      
      test('(Reply) Get a thread with all replies', function(done) {
         chai.request(server)
          .get('/api/replies/testboard')  ////////////////////////////////////////// project "testboard"
          .query({
            thread_id: testID2
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isNotArray(res.body);  //should this be an array?
            assert.property(res.body, 'text');
            assert.property(res.body, 'created_on');
            assert.property(res.body, 'bumped_on');
            assert.property(res.body, 'replies');
            assert.notProperty(res.body, 'delete_password');
            assert.notProperty(res.body, 'reported');
            assert.isArray(res.body.replies);
            done();
          });
      });
      
      test('(Reply) Get a thread with all replies (but no ID supplied)', function(done) {
         chai.request(server)
          .get('/api/replies/testboard')  ////////////////////////////////////////// project "testboard"
          .query({
            
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "no id supplied");
            done();
          });
      });
      
    });
    
    suite('PUT', function() {
      
      test('(Reply) Report a reply with a invalid ID', function(done) { //
        chai.request(server)
          .put('/api/replies/testboard')
          .send({ 
              thread_id: "kgddflgdkjfgdlf",
              reply_id: "ghkjsdfsu"
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "could not find thread kgddflgdkjfgdlf");
            done();
        });
      });
      
      test('(Reply) Report a reply with a valid ID', function(done) { //
        chai.request(server)
          .put('/api/replies/testboard')
          .send({ 
              thread_id: testID2,
              reply_id: testReplyID
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
        });
      });
      
      test('(Reply) Report same reply with a valid ID', function(done) { //
        chai.request(server)
          .put('/api/replies/testboard')
          .send({ 
              thread_id: testID2,
              reply_id: testReplyID
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "already updated");
            done();
        });
      });
      
    });
    
    
    
    suite('DELETE', function() {
      
      // test for a delete without a thread_id or reply_id /////////////////////////////////////
      
      test('(Reply) Attempt delete reply with missing reply_id', function(done) { //
        chai.request(server)
          .delete('/api/replies/testboard')
          .send({ 
              thread_id: testID2,
              delete_password: "54321" 
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "ID not provided");
            done();
        });
      });
      
      test('(Reply) Attempt delete reply with missing thread_id', function(done) { //
        chai.request(server)
          .delete('/api/replies/testboard')
          .send({ 
              reply_id: testReplyID,
              delete_password: "54321" 
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "ID not provided");
            done();
        });
      });
      
      test('(Reply) Attempt delete reply with incorrect password', function(done) { //
        chai.request(server)
          .delete('/api/replies/testboard')
          .send({ 
              thread_id: testID2,
              reply_id: testReplyID,
              delete_password: "wrong" 
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "incorrect password");
            done();
        });
      });
      
      test('(Reply) Attempt delete reply with correct password', function(done) { //
        chai.request(server)
          .delete('/api/replies/testboard')
          .send({ 
              thread_id: testID2,
              reply_id: testReplyID,
              delete_password: "54321" 
          })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.text, "success");
            done();
        });
      });
      
      
    });
    
  });

});
