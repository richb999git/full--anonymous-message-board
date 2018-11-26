/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB;
var db;
// used mongodb directly rather than Mongoose because it was easier to deal with projects

module.exports = function (app) {
  
  MongoClient.connect(CONNECTION_STRING, function(err, dbase) {
    if (err) {
      console.log("databse connection error");
    } else {
      console.log("database connection ok");
      db = dbase;
     }
  }); 
  
  app.route('/api/threads/:board')
  
    .get(function (req, res){
      var board = req.params.board;
      console.log("[threads get]" + board);
      
    
      try {
            db.collection(board).find().sort({bumped_on: -1}).limit(10).toArray(function(err, data) {
              if (err) {
                console.log(err);
                res.json({error: "Error finding thread"});
              } else {
                  // reported and delete_password should not be returned - and top 3 most recent replies
                  var topTen = [];

                  topTen = data.map(function(el) {
                      // get last 3 (max) replies //-3 if 3 or more, -2 if 2, -1 if 1, 0 if 0.... -length or -3
                      var newRepliesArr = el.replies.slice(Math.max(-el.replies.length, -3)).map(function(rep) {
                        return {_id: rep._id, text: rep.text, created_on: rep.created_on};
                      });
                      
                      var newDoc = {};
                      newDoc._id = el._id;
                      newDoc.text = el.text;
                      newDoc.created_on = el.created_on;
                      newDoc.bumped_on = el.bumped_on;
                      newDoc.replycount = el.replycount;  // new for boilerplate html
                      newDoc.replies = newRepliesArr; 
                      return newDoc;
                  });
                  res.json(topTen);
              }
            });
    
        } catch (e) {
            console.log(e);
            res.send("could not find thread");
          }
  
      
    })
    
    .post(function (req, res){
      var board = req.params.board;
      console.log("[threads post]" + board);
      var doc = {};
      doc.text = req.body.text || "";
      doc.delete_password = req.body.delete_password || "";
      if (doc.delete_password !== "" ) {
        // save text to db
        doc.created_on = new Date();
        doc.bumped_on = doc.created_on;
        doc.replies = [];
        doc.reported = false;
        doc.replycount = 0;
        // add the 3 ### here. board = "###" + board; //////////////////////////////////////////////////////////////
        
        db.collection(board).insertOne(doc, function (err, data) {
                if (err) {
                  console.log(err);
                  res.json({error: "Error posting thread"});
                } else {
                    //console.log("--", doc._id); //the _id of the doc is set immediatley and is available immediately
                    //console.log("------", data.insertedId); // insertedId is a special property equivalent to the above
                    //console.log("--", data.ops[0]._id);  // ops is the returned object
                    console.log(data.ops[0]);
                    //res.json(data.ops[0]); // need this line for the tests
                    res.redirect("/b/" + board +"/"); // and then comment this line
                }
              });
      } else {
        console.log("no password");
        res.send("please enter a password");
      }

    })
    
    .put(function (req, res){
      var board = req.params.board;
      console.log("[threads put]" + board);
      var thread_id = req.body.report_id;
      var objToUpdate = { $set: {reported: true} };
    
      try {
          db.collection(board).updateOne({_id: ObjectId(thread_id)}, objToUpdate, function(err, data) {
                console.log("modified: ", data.modifiedCount);
                if (err) {
                  console.log("error");
                  res.send("error");
                } else  if (data.modifiedCount === 1) {                
                     console.log("successfully updated reported to true");
                     //console.log(objToUpdate);
                     res.send("success");
                   } else {
                     console.log("could not update " + thread_id);
                     res.send("could not update " + thread_id);
                   }
          });
      } catch (e) {
        console.log(e);
        res.send("invalid ID");
      }
    })
  
  
    .delete(function (req, res){
      var board = req.params.board;
      console.log("[threads delete]" + board);
      var thread_id = req.body.thread_id;
      var delete_password = req.body.delete_password;
    
      try {  
          db.collection(board).findOne({_id: ObjectId(thread_id)}, function(err, data) {
            if (err) {
                console.log(err);
                res.json({error: "Error finding thread"});
              } else {
                  //console.log(data);
                  if (data) {
                    // now delete it if password is correct
                    if (data.delete_password === delete_password) {

                      db.collection(board).deleteOne({_id: ObjectId(thread_id)}, function(err, data) {
                        if (err) {
                          console.log(err);
                          res.json({error: "Error deleting thread"});
                        } else {
                            console.log("success");
                            res.send("success");
                          }
                      });

                    } else {
                        console.log("incorrect password");
                        res.send("incorrect password");
                      }

                  } else {
                    console.log("no such thread");
                    res.send("no such thread");
                  }
              }
          });
      } catch (e) {
          console.log(e);
          res.send("could not delete thread");
        }

    });
  
  
    
  app.route('/api/replies/:board')
  
    .get(function (req, res) {
      var board = req.params.board;
      console.log("[replies get]" + board);
      var thread_id = req.query.thread_id;
      //console.log(thread_id);
      if (thread_id) {
          try {
                db.collection(board).findOne({_id: ObjectId(thread_id)}, function(err, data) {
                  if (err) {
                    console.log(err);
                    res.json({error: "Error finding thread"});
                  } else {
                      if (data) {
                        // reported and delete_password should not be returned - and to 3 most recent replies
                        var entire = [];
                        // console.log(data);
                        var newRepliesArr = data.replies.map(function(rep) {
                          return {_id: rep._id, text: rep.text, created_on: rep.created_on};
                        });

                        var newDoc = {};
                        newDoc._id = data._id;
                        newDoc.text = data.text;
                        newDoc.created_on = data.created_on;
                        newDoc.bumped_on = data.bumped_on;
                        newDoc.replycount = data.replycount;
                        newDoc.replies = newRepliesArr; 
                        entire.push(newDoc);
                        res.json(entire[0]);  // return as object not array
                      } else {
                        res.send("could not find thread id " + thread_id);
                      }
                  }
                });

            } catch (e) {
                console.log(e);
                res.send("could not find thread");
              }
          
      } else {
        console.log("no id supplied");
        res.send("no id supplied");
      }

    })
    
    
    .post(function (req, res){
      var board = req.params.board;
      var doc = {};
      var thread_id = req.body.thread_id;
      console.log("[replies post]" + board + "/" + thread_id);
      doc.text = req.body.text || "";
      doc.delete_password = req.body.delete_password || "";
      if (doc.delete_password !== "" ) {
        // save text to db
        
        var replies = [];
        // get the existing array of replies from board/thread and add the reply to it
        // could change this to $push the new array item...
        try {
            var queryObj = {};
            if (thread_id) { queryObj._id = ObjectId(thread_id); }
          
            console.log(queryObj);
            db.collection(board).findOne(queryObj, function(err, data) {
              if (err) {
                console.log(err);
                res.json({error: "Error finding thread"});
              } else {
                  replies = data.replies;
        
                  // now add the reply to the array
                  doc.created_on = new Date();
                  doc.reported = false;
                  doc._id = "p" + Math.floor(new Date().getTime() + Math.random() * 100); // need to create a unique id for the reply
                  replies.push(doc);

                  // now add the bumped date to the thread and the replies
                  var replycount = data.replycount + 1;
                  var bumped = doc.created_on;
                  var updateObj = {bumped_on: bumped, replycount: replycount, replies: replies};

                    try {
                        db.collection(board).updateOne({_id: ObjectId(thread_id)}, { $set: updateObj }, function(err, data) {
                              console.log("modified: ", data.modifiedCount);
                              if (err) {
                                console.log("error");
                                res.send("error");
                              } else  if (data.modifiedCount === 1) {                
                                   console.log("successfully updated");
                                   console.log(updateObj);
                                   //res.json(updateObj); // need this line for the tests
                                   res.redirect("/b/" + board + "/" + thread_id + "/"); // and then comment out this line
                                 } else {
                                   console.log("could not update " + thread_id);
                                   res.send("could not update " + thread_id);
                                 }
                        });
                    } catch (e) {
                      console.log(e);
                      res.send("could not update " + thread_id);
                    }
                
              }
            });
          
        } catch (e) {
            console.log(e);
            res.send("could not find " + thread_id);
          }
        
      } else {
        console.log("no password");
        res.send("please enter a password");
      }

    })
  
  
    
    .put(function (req, res){
      var board = req.params.board;
      console.log("[replies put]" + board);
      var thread_id = req.body.thread_id;
      var reply_id = req.body.reply_id;
    
      
        
        var replies = [];
        // get the existing array of replies from board/thread and add the reply to it
        // could change this to $push the new array item...
        try {
            var queryObj = {};
            if (thread_id) { queryObj._id = ObjectId(thread_id); }
            db.collection(board).findOne(queryObj, function(err, data) {
              if (err) {
                console.log(err);
                res.json({error: "Error finding thread"});
              } else {
                  //console.log(data);
                  var reported = false;
                  replies = data.replies.map(function(el) {
                    if (el._id === reply_id) {
                      if (el.reported === false) {
                        el.reported = true;
                        reported = "updated";
                      } else {
                        reported = "already updated";
                      }
                    }
                    return el;
                  });
                
                  if (reported === "updated") {
 
                      var updateObj = {replies: replies};
                      var objToUpdate = { $set: updateObj };

                        try {
                            db.collection(board).updateOne({_id: ObjectId(thread_id)}, objToUpdate, function(err, data) {
                                  console.log("modified: ", data.modifiedCount);
                                  if (err) {
                                    console.log("error");
                                    res.send("error");
                                  } else  if (data.modifiedCount === 1) {                
                                       console.log("successfully updated");
                                       //console.log(updateObj);
                                       res.send("success");
                                     } else {
                                       console.log("could not update " + thread_id);
                                       res.send("could not update " + thread_id);
                                     }
                            });
                        } catch (e) {
                          console.log(e);
                          res.send("could not update " + thread_id);
                        }
                  
                  } else if (reported === "already updated") {
                      console.log("already updated");
                      res.send("already updated");
                  } else {
                      console.log("invalid ID");
                      res.send("invalid ID");
                  }
                
              }
            });
          
        } catch (e) {
            console.log(e);
            res.send("could not find thread " + thread_id);
          }
    
    })
  
  
  
    .delete(function (req, res){
      var board = req.params.board;
      console.log("[replies delete]" + board);
      var thread_id = req.body.thread_id;
      var reply_id = req.body.reply_id;
      var delete_password = req.body.delete_password;
    
      if (reply_id && thread_id) {
    
          try {  
              db.collection(board).findOne({_id: ObjectId(thread_id)}, function(err, data) {
                if (err) {
                    console.log(err);
                    res.json({error: "Error finding thread"});
                  } else {
                      console.log(data);
                      if (data) {
                        // now find the reply with an id of reply_id
                        // then change the text on it to "[deleted]" it if password is correct   
                        var password_correct = false;
                        var pos = false;
                        var revisedArr = data.replies.map(function(el, index) {
                          var obj = el;
                          if (el._id === reply_id && el.delete_password === delete_password) {
                            obj.text = "[deleted]";
                            password_correct = true;
                            pos = index;
                          }
                          return obj;
                        });
                        
                        // original spec was to show reply as "[deleted]" but now they are actually deleted (and replycount reduced)
                        var removed = revisedArr.splice(pos,1);
                        // reduce replycount by 1                      
                        var objToAdjust = {$set: {replies: revisedArr}, $inc: { replycount: -1 } };
                        console.log("-----------objToAdjust-----------", objToAdjust)

                        if (password_correct) {  

                          db.collection(board).updateOne({_id: ObjectId(thread_id)}, objToAdjust,  function(err, data) {
                            if (err) {
                              console.log(err);
                              res.json({error: "Error deleting thread"});
                            } else {
                                console.log("success");
                                res.send("success");
                              }
                          });


                        } else {
                            console.log("incorrect password");
                            res.send("incorrect password");
                          }

                      } else {
                        console.log("could not find thread");
                        res.send("could not find thread");
                      }
                  }
              });
            
          } catch (e) {
              console.log(e);
              res.send("could not find thread");
            }

      } else {
        console.log("ID not provided");
        res.send("ID not provided");
      }

    });
  
  
  // add or get the boards themselves
  app.route('/api/boards')
  
    // get an array of boards for homepage
    .get(function (req, res){
      console.log("[boards get]");
      db.collection("__boards").findOne( {}, function (err, data) {
              if (err) {
                console.log(err);
                res.json({error: "Error posting thread"});
              } else {
                  console.log(data);
                  res.send(data.boards);
              }
          });
    
    })
  
    // need to check the database for boards first to see if the one submitted already exists
    .post(function (req, res){
      var boardToAdd = req.body.newBoard;
      console.log("[boards post] " + boardToAdd);  
      if (boardToAdd === "" || boardToAdd === undefined || boardToAdd === "__boards") {
        console.log("invalid board provided");
        res.redirect("/");
      } else {
        
        // get boards and then check if submitted board exists. If not then push it on
          db.collection("__boards").findOne({}, function (err, data) {
              if (err) {
                console.log(err);
                res.json({error: "Error posting thread"});
              } else {
                  console.log(data.boards);
                  var found = data.boards.indexOf(boardToAdd) !== -1;
                  if (!found) {
                    db.collection("__boards").updateOne({ _id: ObjectId("5bf886d8ea587d14fe4f1603") }, { $push: { boards: boardToAdd } }, function (err, data) {
                        if (err) {
                          console.log(err);
                          res.json({error: "Error posting thread"});
                        } else {
                            console.log("board added");
                            res.redirect("/b/" + boardToAdd + "/");
                        }
                    });
                  } else {
                    console.log("Board already exists");
                    //res.send("Board already exists");
                    res.redirect("/");
                  }
              }
          });  
      }    
    });
  

}