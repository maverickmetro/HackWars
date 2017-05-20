'use strict';

exports.deleteUserPostWithMultiplePath = function(args, res, next) {
  /**
   * parameters expected in the args:
  * user_id (Long)
  * post_id (Long)
  **/
  // no response value expected for this operation
  res.setHeader('Content-Type', 'application/json');
  res.end("{}");
}

exports.readUserPostWithMultiplePath = function(args, res, next) {
  /**
   * parameters expected in the args:
  * user_id (Long)
  * post_id (Long)
  **/
    var examples = {};
  examples['application/json'] = [ {
  "id" : 1,
  "title" : "My Title",
  "body" : "some body text",
  "userId" : 1
} ];
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

exports.updateUserPostWithQueryBodyParameter = function(args, res, next) {
  /**
   * parameters expected in the args:
  * testQuery (String)
  * user_id (Long)
  * post_id (Long)
  * body (User)
  **/
    var examples = {};
  examples['application/json'] = {
  "website" : "hildegard.org",
  "address" : {
    "instructions" : {
      "doorman" : true,
      "text" : "some delivery instructions text"
    },
    "city" : "New York",
    "postalCode" : "10577",
    "id" : 1,
    "state" : "NY",
    "line1" : "2000 Purchase Street"
  },
  "phone" : "1-770-736-8031",
  "name" : "Joe Bloggs",
  "id" : 1,
  "email" : "name@example.com",
  "username" : "jbloggs"
};
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

