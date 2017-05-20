'use strict';

exports.addPost = function(args, res, next) {
  /**
   * parameters expected in the args:
  * body (Post)
  **/
    var examples = {};
  examples['application/json'] = {
  "id" : 1,
  "title" : "My Title",
  "body" : "some body text",
  "userId" : 1
};
  if(Object.keys(examples).length > 0) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(examples[Object.keys(examples)[0]] || {}, null, 2));
  }
  else {
    res.end();
  }
  
}

